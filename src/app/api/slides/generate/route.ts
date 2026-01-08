/**
 * Slide Generation API
 *
 * POST /api/slides/generate
 * Generates teaching slides from lesson content using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import {
  SlideGenerateRequest,
  SlideDeck,
  Slide,
  SlideBlock,
} from '@/types/domain';

// Maximum content length
const MAX_CONTENT_LENGTH = 6000;

// Slide generation system prompt
const SYSTEM_PROMPT = `Bạn là một chuyên gia thiết kế slide giảng dạy cho giáo viên Việt Nam.
Nhiệm vụ của bạn là tạo bộ slide từ nội dung bài học được cung cấp.

QUY TẮC THIẾT KẾ SLIDE:
1. Mỗi slide nên có ít nội dung, dễ đọc, dễ hiểu
2. Sử dụng bullet points thay vì đoạn văn dài
3. Mỗi slide tập trung vào MỘT ý chính
4. Ngôn ngữ đơn giản, phù hợp với học sinh
5. Thêm câu hỏi thảo luận hoặc bài tập nhỏ để tăng tương tác

CẤU TRÚC BỘ SLIDE:
- Slide 1: Giới thiệu (tên bài, mục tiêu học tập)
- Slide 2-N: Nội dung chính (mỗi chủ đề 1-2 slides)
- Slide cuối: Tóm tắt & câu hỏi ôn tập

LOẠI BLOCK CÓ THỂ DÙNG:
- title: Tiêu đề lớn
- subtitle: Tiêu đề phụ
- paragraph: Đoạn văn ngắn (tối đa 2 câu)
- bullet-list: Danh sách bullet (tối đa 5 items)
- numbered-list: Danh sách đánh số
- quote: Trích dẫn hoặc công thức quan trọng
- exercise: Câu hỏi thảo luận / bài tập
- key-point: Điểm quan trọng cần nhớ

OUTPUT FORMAT:
Trả về JSON với cấu trúc SlideDeck. Không thêm markdown code block, chỉ JSON thuần.`;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SlideGenerateRequest = await request.json();
    const {
      mode,
      lessonTitle,
      gradeLevel,
      subject,
      content,
      targetSlideCount = 10,
    } = body;

    // Validate required fields
    if (!lessonTitle || lessonTitle.trim().length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên bài học' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Không có nội dung để tạo slide' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Nội dung quá dài. Tối đa ${MAX_CONTENT_LENGTH} ký tự.` },
        { status: 400 }
      );
    }

    // Validate slide count
    const slideCount = Math.max(5, Math.min(15, targetSlideCount));

    // Build user prompt
    const userPrompt = buildUserPrompt({
      mode,
      lessonTitle,
      gradeLevel,
      subject,
      content,
      slideCount,
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    // Call Gemini
    const model = getGeminiModel('gemini-1.5-flash', {
      responseMimeType: 'application/json',
      temperature: 0.7,
    });

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    if (!responseText) {
      return NextResponse.json(
        { error: 'Không nhận được phản hồi từ AI' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsedDeck: SlideDeck;
    try {
      const parsed = JSON.parse(responseText);
      parsedDeck = normalizeSlideDeck(parsed, lessonTitle, gradeLevel, subject);
    } catch {
      console.error('Failed to parse slide JSON:', responseText);
      return NextResponse.json(
        { error: 'Không thể xử lý kết quả từ AI. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ deck: parsedDeck });
  } catch (error) {
    console.error('Slide generation error:', error);
    return NextResponse.json(
      { error: 'Không thể tạo slide. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

/**
 * Build user prompt for slide generation
 */
function buildUserPrompt(params: {
  mode: string;
  lessonTitle: string;
  gradeLevel?: string;
  subject?: string;
  content: string;
  slideCount: number;
}): string {
  const { mode, lessonTitle, gradeLevel, subject, content, slideCount } = params;

  let modeDescription = 'nội dung bài học';
  if (mode === 'from-lesson-plan') {
    modeDescription = 'kế hoạch bài giảng';
  } else if (mode === 'from-study-guide') {
    modeDescription = 'tài liệu ôn tập';
  }

  let contextInfo = `Tên bài học: ${lessonTitle}`;
  if (gradeLevel) contextInfo += `\nKhối lớp: ${gradeLevel}`;
  if (subject) contextInfo += `\nMôn học: ${subject}`;

  return `Tạo bộ slide giảng dạy từ ${modeDescription} sau:

${contextInfo}

NỘI DUNG:
${content}

YÊU CẦU:
- Tạo khoảng ${slideCount} slides
- Slide đầu tiên là giới thiệu bài học
- Slide cuối là tóm tắt và câu hỏi ôn tập
- Mỗi slide có tối đa 3-4 blocks
- Sử dụng ngôn ngữ phù hợp với học sinh${gradeLevel ? ` lớp ${gradeLevel}` : ''}

Trả về JSON với cấu trúc:
{
  "slides": [
    {
      "id": "slide-1",
      "title": "Tiêu đề slide (optional)",
      "blocks": [
        { "type": "title", "text": "..." },
        { "type": "bullet-list", "items": ["...", "..."] }
      ],
      "notesForTeacher": "Ghi chú cho giáo viên (optional)"
    }
  ]
}`;
}

/**
 * Normalize and validate slide deck from AI response
 */
function normalizeSlideDeck(
  parsed: Record<string, unknown>,
  lessonTitle: string,
  gradeLevel?: string,
  subject?: string
): SlideDeck {
  const slides: Slide[] = [];
  const deck = parsed.deck as Record<string, unknown> | undefined;
  const rawSlides = (parsed.slides || deck?.slides || []) as Record<string, unknown>[];

  for (let i = 0; i < rawSlides.length; i++) {
    const rawSlide = rawSlides[i];
    const slide: Slide = {
      id: (rawSlide.id as string) || `slide-${i + 1}`,
      title: rawSlide.title as string | undefined,
      blocks: normalizeBlocks((rawSlide.blocks || []) as Record<string, unknown>[]),
      notesForTeacher: rawSlide.notesForTeacher as string | undefined,
      layout: (rawSlide.layout as Slide['layout']) || 'default',
    };
    slides.push(slide);
  }

  return {
    id: `deck-${Date.now()}`,
    lessonTitle,
    gradeLevel,
    subject,
    slides,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Normalize slide blocks
 */
function normalizeBlocks(rawBlocks: Record<string, unknown>[]): SlideBlock[] {
  const blocks: SlideBlock[] = [];

  for (const raw of rawBlocks) {
    const type = raw.type as string;

    switch (type) {
      case 'title':
      case 'subtitle':
      case 'paragraph':
        if (raw.text) {
          blocks.push({ type, text: String(raw.text) } as SlideBlock);
        }
        break;
      case 'bullet-list':
      case 'numbered-list':
        if (Array.isArray(raw.items)) {
          blocks.push({
            type,
            items: raw.items.map((item: unknown) => String(item)),
          } as SlideBlock);
        }
        break;
      case 'quote':
        if (raw.text) {
          blocks.push({
            type: 'quote',
            text: String(raw.text),
            author: raw.author ? String(raw.author) : undefined,
          });
        }
        break;
      case 'exercise':
        if (raw.prompt) {
          blocks.push({
            type: 'exercise',
            prompt: String(raw.prompt),
            hint: raw.hint ? String(raw.hint) : undefined,
          });
        }
        break;
      case 'image-suggestion':
        if (raw.prompt) {
          blocks.push({
            type: 'image-suggestion',
            prompt: String(raw.prompt),
          });
        }
        break;
      case 'key-point':
        if (raw.text) {
          blocks.push({
            type: 'key-point',
            text: String(raw.text),
            icon: raw.icon ? String(raw.icon) : undefined,
          });
        }
        break;
      default:
        // Convert unknown types to paragraph
        if (raw.text) {
          blocks.push({ type: 'paragraph', text: String(raw.text) });
        }
    }
  }

  return blocks;
}
