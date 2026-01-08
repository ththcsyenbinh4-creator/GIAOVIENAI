/**
 * Document AI Processing API
 *
 * POST /api/document-ai/process
 * Uploads and processes a document, generating educational content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseDocument, detectDocumentType } from '@/services/document-ai/parsers';
import { processDocumentWithAI } from '@/services/document-ai/ai-analyzer';
import { AIGenerationMode, DocumentProcessingJob } from '@/types/domain';
import { v4 as uuidv4 } from 'uuid';

// Store jobs in memory (in production, use Redis or database)
const processingJobs = new Map<string, DocumentProcessingJob>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = formData.get('mode') as AIGenerationMode;

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    if (!mode) {
      return NextResponse.json(
        { error: 'Vui lòng chọn chế độ xử lý' },
        { status: 400 }
      );
    }

    // Detect file type
    const fileType = detectDocumentType(file.name, file.type);
    if (!fileType) {
      return NextResponse.json(
        { error: 'Định dạng file không được hỗ trợ. Vui lòng sử dụng PDF, Word (.docx), hoặc PowerPoint (.pptx)' },
        { status: 400 }
      );
    }

    // Parse options from form data
    const options = {
      questionCount: parseInt(formData.get('questionCount') as string) || 10,
      difficulty: (formData.get('difficulty') as 'easy' | 'medium' | 'hard' | 'mixed') || 'mixed',
      questionTypes: (formData.get('questionTypes') as string)?.split(',') as ('mcq' | 'essay')[] || ['mcq', 'essay'],
      targetGrade: parseInt(formData.get('targetGrade') as string) || undefined,
      duration: parseInt(formData.get('duration') as string) || 45,
    };

    // Create job entry
    const jobId = uuidv4();
    const job: DocumentProcessingJob = {
      id: jobId,
      fileName: file.name,
      fileType,
      mode,
      status: 'extracting',
      progress: 10,
      progressMessage: 'Đang trích xuất nội dung từ file...',
      createdAt: new Date().toISOString(),
    };
    processingJobs.set(jobId, job);

    // Process in background (for production, use a proper job queue)
    processDocumentAsync(jobId, file, mode, options);

    return NextResponse.json({
      jobId,
      message: 'Đang xử lý tài liệu',
      status: 'processing',
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: 'Lỗi xử lý tài liệu. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

/**
 * Process document asynchronously
 */
async function processDocumentAsync(
  jobId: string,
  file: File,
  mode: AIGenerationMode,
  options: {
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    questionTypes: ('mcq' | 'essay')[];
    targetGrade?: number;
    duration: number;
  }
) {
  const job = processingJobs.get(jobId);
  if (!job) return;

  try {
    // Step 1: Extract content from file
    const buffer = await file.arrayBuffer();
    const extractedDocument = await parseDocument(buffer, file.name, job.fileType);

    job.extractedDocument = extractedDocument;
    job.progress = 40;
    job.status = 'analyzing';
    job.progressMessage = 'Đang phân tích nội dung với AI...';
    processingJobs.set(jobId, { ...job });

    // Step 2: Process with AI
    const generatedContent = await processDocumentWithAI(extractedDocument, mode, {
      questionCount: options.questionCount,
      difficulty: options.difficulty,
      questionTypes: options.questionTypes,
      targetGrade: options.targetGrade,
      duration: options.duration,
    });

    job.generatedContent = generatedContent;
    job.progress = 100;
    job.status = 'completed';
    job.progressMessage = 'Hoàn tất!';
    job.completedAt = new Date().toISOString();
    processingJobs.set(jobId, { ...job });
  } catch (error) {
    console.error('Document processing failed:', error);
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Lỗi không xác định';
    job.progressMessage = 'Đã xảy ra lỗi khi xử lý tài liệu';
    processingJobs.set(jobId, { ...job });
  }
}

/**
 * GET /api/document-ai/process?jobId=xxx
 * Get processing job status and results
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Thiếu jobId' },
      { status: 400 }
    );
  }

  const job = processingJobs.get(jobId);
  if (!job) {
    return NextResponse.json(
      { error: 'Không tìm thấy job' },
      { status: 404 }
    );
  }

  return NextResponse.json(job);
}
