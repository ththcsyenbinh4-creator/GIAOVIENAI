/**
 * Document Parsers for PDF, Word, and PowerPoint files
 *
 * These parsers extract text content and structure from uploaded documents.
 */

import mammoth from 'mammoth';
import JSZip from 'jszip';
import { DocumentSection, DocumentType, ExtractedDocument } from '@/types/domain';
import { v4 as uuidv4 } from 'uuid';

// Lazy load pdfjs-dist to avoid build-time DOMMatrix errors
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    try {
      // Dynamic import to avoid server-side bundle issues
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    } catch (e) {
      console.error('Failed to load pdfjs-dist', e);
      throw new Error('PDF processing is not available (missing pdfjs-dist)');
    }
  }
  return pdfjsLib;
}

/**
 * Detect document type from file extension or MIME type
 */
export function detectDocumentType(fileName: string, mimeType?: string): DocumentType | null {
  const ext = fileName.toLowerCase().split('.').pop();

  if (ext === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (ext === 'pptx' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';

  return null;
}

/**
 * Parse PDF document and extract text content
 */
export async function parsePDF(buffer: ArrayBuffer, fileName: string): Promise<ExtractedDocument> {
  const pdfjs = await getPdfJs();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const numPages = pdf.numPages;
  const sections: DocumentSection[] = [];
  let rawText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let pageText = '';
    let currentParagraph = '';
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if ('str' in item) {
        const text = item.str;
        const transform = item.transform;
        const y = transform ? transform[5] : 0;

        // Detect new paragraph (significant Y position change)
        if (lastY !== null && Math.abs(y - lastY) > 15) {
          if (currentParagraph.trim()) {
            sections.push({
              id: uuidv4(),
              content: currentParagraph.trim(),
              pageNumber: pageNum,
              type: detectSectionType(currentParagraph),
            });
            pageText += currentParagraph + '\n\n';
          }
          currentParagraph = text;
        } else {
          currentParagraph += text;
        }
        lastY = y;
      }
    }

    // Add remaining paragraph
    if (currentParagraph.trim()) {
      sections.push({
        id: uuidv4(),
        content: currentParagraph.trim(),
        pageNumber: pageNum,
        type: detectSectionType(currentParagraph),
      });
      pageText += currentParagraph;
    }

    rawText += pageText + '\n\n';
  }

  return {
    id: uuidv4(),
    fileName,
    fileType: 'pdf',
    fileSize: buffer.byteLength,
    totalPages: numPages,
    sections: mergeSections(sections),
    rawText: rawText.trim(),
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Parse Word document (.docx) and extract text content
 */
export async function parseWord(buffer: ArrayBuffer, fileName: string): Promise<ExtractedDocument> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const rawText = result.value;

  // Also get HTML for better structure
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const htmlContent = htmlResult.value;

  // Parse sections from HTML
  const sections = parseHTMLToSections(htmlContent);

  return {
    id: uuidv4(),
    fileName,
    fileType: 'docx',
    fileSize: buffer.byteLength,
    sections: sections.length > 0 ? sections : createSectionsFromText(rawText),
    rawText,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Parse PowerPoint document (.pptx) and extract text content
 */
export async function parsePowerPoint(buffer: ArrayBuffer, fileName: string): Promise<ExtractedDocument> {
  const zip = await JSZip.loadAsync(buffer);
  const sections: DocumentSection[] = [];
  let rawText = '';
  let slideCount = 0;

  // PPTX files contain slides in ppt/slides/slideN.xml
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  for (const slidePath of slideFiles) {
    slideCount++;
    const slideXml = await zip.file(slidePath)?.async('text');

    if (slideXml) {
      const slideText = extractTextFromXML(slideXml);

      if (slideText.trim()) {
        // Try to detect slide title (usually first text block)
        const lines = slideText.split('\n').filter(l => l.trim());
        const title = lines[0] || `Slide ${slideCount}`;
        const content = lines.slice(1).join('\n');

        sections.push({
          id: uuidv4(),
          title,
          content: content || title,
          slideNumber: slideCount,
          type: 'heading',
          metadata: { level: 1 },
        });

        if (content) {
          sections.push({
            id: uuidv4(),
            content,
            slideNumber: slideCount,
            type: detectSectionType(content),
          });
        }

        rawText += `=== Slide ${slideCount} ===\n${slideText}\n\n`;
      }
    }
  }

  return {
    id: uuidv4(),
    fileName,
    fileType: 'pptx',
    fileSize: buffer.byteLength,
    totalSlides: slideCount,
    sections,
    rawText: rawText.trim(),
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Helper: Extract text from XML content (for PPTX)
 */
function extractTextFromXML(xml: string): string {
  // Remove XML tags and extract text content
  // This is a simple approach - for production, use a proper XML parser
  const textMatches = xml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
  const texts = textMatches.map(match => {
    const content = match.replace(/<\/?a:t>/g, '');
    return content;
  });

  // Group by paragraphs (a:p tags)
  const paragraphs: string[] = [];
  let currentParagraph = '';
  let inParagraph = false;

  for (let i = 0; i < xml.length; i++) {
    if (xml.substring(i, i + 4) === '<a:p') {
      inParagraph = true;
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = '';
    } else if (xml.substring(i, i + 6) === '</a:p>') {
      inParagraph = false;
    }
  }

  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }

  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Helper: Detect section type based on content
 */
function detectSectionType(content: string): DocumentSection['type'] {
  const trimmed = content.trim();

  // Check for list patterns
  if (/^[\d]+\.\s/.test(trimmed) || /^[a-z]\)\s/i.test(trimmed)) {
    return 'list';
  }
  if (/^[-•*]\s/.test(trimmed)) {
    return 'list';
  }

  // Check for heading patterns (short, ends without period, etc.)
  if (trimmed.length < 100 && !trimmed.endsWith('.') && /^[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]/.test(trimmed)) {
    return 'heading';
  }

  // Check for formula patterns
  if (/[=+\-*/^√∑∫∂]/.test(trimmed) && /\d/.test(trimmed)) {
    return 'formula';
  }

  return 'paragraph';
}

/**
 * Helper: Parse HTML content to sections
 */
function parseHTMLToSections(html: string): DocumentSection[] {
  const sections: DocumentSection[] = [];

  // Simple regex-based parsing (for production, use a proper HTML parser)
  const headingPattern = /<h(\d)>([^<]*)<\/h\d>/gi;
  const paragraphPattern = /<p>([^<]*)<\/p>/gi;
  const listItemPattern = /<li>([^<]*)<\/li>/gi;

  let match;

  // Extract headings
  while ((match = headingPattern.exec(html)) !== null) {
    sections.push({
      id: uuidv4(),
      content: match[2].trim(),
      type: 'heading',
      metadata: { level: parseInt(match[1]) },
    });
  }

  // Extract paragraphs
  while ((match = paragraphPattern.exec(html)) !== null) {
    const content = match[1].trim();
    if (content) {
      sections.push({
        id: uuidv4(),
        content,
        type: 'paragraph',
      });
    }
  }

  // Extract list items
  while ((match = listItemPattern.exec(html)) !== null) {
    sections.push({
      id: uuidv4(),
      content: match[1].trim(),
      type: 'list',
    });
  }

  return sections;
}

/**
 * Helper: Create sections from plain text
 */
function createSectionsFromText(text: string): DocumentSection[] {
  const paragraphs = text.split(/\n\n+/);

  return paragraphs
    .filter(p => p.trim())
    .map(p => ({
      id: uuidv4(),
      content: p.trim(),
      type: detectSectionType(p),
    }));
}

/**
 * Helper: Merge small sections that belong together
 */
function mergeSections(sections: DocumentSection[]): DocumentSection[] {
  if (sections.length <= 1) return sections;

  const merged: DocumentSection[] = [];
  let current: DocumentSection | null = null;

  for (const section of sections) {
    if (!current) {
      current = { ...section };
      continue;
    }

    // Merge if both are paragraphs and on same page, and combined length is reasonable
    if (
      current.type === 'paragraph' &&
      section.type === 'paragraph' &&
      current.pageNumber === section.pageNumber &&
      current.content.length + section.content.length < 2000
    ) {
      current.content += '\n' + section.content;
    } else {
      merged.push(current);
      current = { ...section };
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}

/**
 * Main parser function - routes to appropriate parser based on file type
 */
export async function parseDocument(
  buffer: ArrayBuffer,
  fileName: string,
  fileType: DocumentType
): Promise<ExtractedDocument> {
  switch (fileType) {
    case 'pdf':
      return parsePDF(buffer, fileName);
    case 'docx':
      return parseWord(buffer, fileName);
    case 'pptx':
      return parsePowerPoint(buffer, fileName);
    case 'image':
      // For images, we'll need OCR - return placeholder for now
      return {
        id: uuidv4(),
        fileName,
        fileType: 'image',
        fileSize: buffer.byteLength,
        sections: [],
        rawText: '[Image - OCR processing required]',
        extractedAt: new Date().toISOString(),
      };
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
