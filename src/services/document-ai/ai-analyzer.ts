/**
 * AI Document Analyzer Service
 *
 * Uses OpenAI to analyze extracted document content and generate
 * educational materials (questions, summaries, lesson plans, etc.)
 */

import { v4 as uuidv4 } from 'uuid';
import { getGeminiModel } from '@/lib/gemini';
import {
  ExtractedDocument,
  AIDocumentAnalysis,
  AIGeneratedContent,
  AIGenerationMode,
  GeneratedQuestion,
} from '@/types/domain';

/**
 * Analyze document content and extract key information
 */
export async function analyzeDocument(
  document: ExtractedDocument
): Promise<AIDocumentAnalysis> {
  const prompt = `Bạn là một giáo viên chuyên nghiệp. Hãy phân tích nội dung tài liệu giáo dục sau và trích xuất các thông tin quan trọng.

NỘI DUNG TÀI LIỆU:
${document.rawText.substring(0, 8000)}

Hãy phân tích và trả về JSON với cấu trúc sau:
{
  "summary": "Tóm tắt ngắn gọn nội dung chính (2-3 câu)",
  "keyConcepts": ["Danh sách các khái niệm quan trọng"],
  "mainTopics": [
    {
      "topic": "Tên chủ đề",
      "description": "Mô tả ngắn",
      "bloomLevel": "remember|understand|apply|analyze|evaluate|create"
    }
  ],
  "formulas": ["Các công thức toán học/khoa học nếu có"],
  "examples": ["Các ví dụ minh họa trong tài liệu"]
}

Chỉ trả về JSON, không có text khác.`;

  const model = getGeminiModel('gemini-1.5-flash', {
    responseMimeType: 'application/json',
    temperature: 0.3,
  });

  const result = await model.generateContent(prompt);
  const content = result.response.text();
  const analysis = JSON.parse(content);

  return {
    id: uuidv4(),
    documentId: document.id,
    summary: analysis.summary || 'Không thể tạo tóm tắt',
    keyConcepts: analysis.keyConcepts || [],
    mainTopics: analysis.mainTopics || [],
    formulas: analysis.formulas,
    examples: analysis.examples,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Generate questions from document content
 */
export async function generateQuestionsFromDocument(
  document: ExtractedDocument,
  analysis: AIDocumentAnalysis,
  options: {
    count: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    types: ('mcq' | 'essay' | 'fill_blank' | 'matching')[];
    targetGrade?: number;
  }
): Promise<GeneratedQuestion[]> {
  const difficultyInstructions = {
    easy: 'Câu hỏi ở mức độ cơ bản, kiểm tra kiến thức nhớ và hiểu.',
    medium: 'Câu hỏi ở mức độ trung bình, yêu cầu vận dụng kiến thức.',
    hard: 'Câu hỏi ở mức độ nâng cao, yêu cầu phân tích và đánh giá.',
    mixed: 'Kết hợp các mức độ: 30% dễ, 50% trung bình, 20% khó.',
  };

  const typeInstructions = options.types.map(t => {
    switch (t) {
      case 'mcq': return 'Trắc nghiệm (4 đáp án A, B, C, D)';
      case 'essay': return 'Tự luận (yêu cầu giải thích)';
      case 'fill_blank': return 'Điền khuyết';
      case 'matching': return 'Ghép nối';
      default: return '';
    }
  }).join(', ');

  const prompt = `Bạn là một giáo viên chuyên nghiệp. Dựa trên nội dung tài liệu sau, hãy tạo ${options.count} câu hỏi kiểm tra.

TÓM TẮT NỘI DUNG:
${analysis.summary}

KHÁI NIỆM CHÍNH:
${analysis.keyConcepts.join(', ')}

NỘI DUNG CHI TIẾT:
${document.rawText.substring(0, 6000)}

YÊU CẦU:
- Số lượng: ${options.count} câu hỏi
- Độ khó: ${difficultyInstructions[options.difficulty]}
- Loại câu hỏi: ${typeInstructions}
${options.targetGrade ? `- Phù hợp với học sinh lớp ${options.targetGrade}` : ''}

Trả về JSON với cấu trúc:
{
  "questions": [
    {
      "type": "mcq",
      "prompt": "Nội dung câu hỏi",
      "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswerIndex": 0,
      "maxScore": 1,
      "explanation": "Giải thích đáp án đúng"
    },
    {
      "type": "essay",
      "prompt": "Nội dung câu hỏi tự luận",
      "maxScore": 2,
      "rubric": "Tiêu chí chấm điểm"
    }
  ]
}

Chỉ trả về JSON, không có text khác.`;

  const model = getGeminiModel('gemini-1.5-flash', {
    responseMimeType: 'application/json',
    temperature: 0.7,
  });

  const result = await model.generateContent(prompt);
  const content = result.response.text();
  const parsed = JSON.parse(content);

  return (parsed.questions || []).map((q: Record<string, unknown>) => ({
    type: q.type === 'essay' ? 'essay' : 'mcq',
    prompt: q.prompt as string,
    choices: q.choices as string[] | undefined,
    correctAnswerIndex: q.correctAnswerIndex as number | null | undefined,
    maxScore: (q.maxScore as number) || 1,
    source: 'ai' as const,
  }));
}

/**
 * Generate lesson plan from document
 */
export async function generateLessonPlan(
  document: ExtractedDocument,
  analysis: AIDocumentAnalysis,
  options: {
    duration: number; // in minutes
    targetGrade?: number;
  }
): Promise<AIGeneratedContent['lessonOutline']> {
  const prompt = `Bạn là một giáo viên giỏi. Hãy tạo giáo án cho nội dung sau:

TÓM TẮT NỘI DUNG:
${analysis.summary}

CHỦ ĐỀ CHÍNH:
${analysis.mainTopics.map(t => `- ${t.topic}: ${t.description}`).join('\n')}

NỘI DUNG CHI TIẾT:
${document.rawText.substring(0, 4000)}

YÊU CẦU:
- Thời lượng: ${options.duration} phút
${options.targetGrade ? `- Đối tượng: Học sinh lớp ${options.targetGrade}` : ''}
- Chia thành các phần rõ ràng với hoạt động cụ thể

Trả về JSON:
{
  "lessonOutline": [
    {
      "section": "Tên phần",
      "duration": "X phút",
      "activities": ["Hoạt động 1", "Hoạt động 2"],
      "objectives": ["Mục tiêu 1", "Mục tiêu 2"]
    }
  ]
}

Chỉ trả về JSON.`;

  const model = getGeminiModel('gemini-1.5-flash', {
    responseMimeType: 'application/json',
    temperature: 0.5,
  });

  const result = await model.generateContent(prompt);
  const content = result.response.text();
  const parsed = JSON.parse(content);

  return parsed.lessonOutline || [];
}

/**
 * Generate study guide from document
 */
export async function generateStudyGuide(
  document: ExtractedDocument,
  analysis: AIDocumentAnalysis
): Promise<AIGeneratedContent['studyGuide']> {
  const prompt = `Bạn là một giáo viên. Hãy tạo tài liệu ôn tập cho học sinh dựa trên nội dung sau:

TÓM TẮT:
${analysis.summary}

KHÁI NIỆM QUAN TRỌNG:
${analysis.keyConcepts.join(', ')}

${analysis.formulas?.length ? `CÔNG THỨC:\n${analysis.formulas.join('\n')}` : ''}

NỘI DUNG:
${document.rawText.substring(0, 5000)}

Trả về JSON:
{
  "studyGuide": [
    {
      "topic": "Tên chủ đề",
      "keyPoints": ["Điểm quan trọng 1", "Điểm quan trọng 2"],
      "practiceQuestions": ["Câu hỏi ôn tập 1", "Câu hỏi ôn tập 2"]
    }
  ]
}

Chỉ trả về JSON.`;

  const model = getGeminiModel('gemini-1.5-flash', {
    responseMimeType: 'application/json',
    temperature: 0.5,
  });

  const result = await model.generateContent(prompt);
  const content = result.response.text();
  const parsed = JSON.parse(content);

  return parsed.studyGuide || [];
}

/**
 * Generate summary from document
 */
export async function generateSummary(
  document: ExtractedDocument,
  analysis: AIDocumentAnalysis,
  options: {
    length: 'short' | 'medium' | 'long';
  }
): Promise<string> {
  const lengthInstructions = {
    short: '100-150 từ',
    medium: '200-300 từ',
    long: '400-500 từ',
  };

  const prompt = `Tạo bản tóm tắt nội dung sau dành cho học sinh:

NỘI DUNG:
${document.rawText.substring(0, 6000)}

YÊU CẦU:
- Độ dài: ${lengthInstructions[options.length]}
- Ngôn ngữ: Dễ hiểu, phù hợp với học sinh
- Bao gồm các ý chính và khái niệm quan trọng
- Có thể sử dụng bullet points

Trả về JSON:
{
  "summary": "Nội dung tóm tắt"
}`;

  const model = getGeminiModel('gemini-1.5-flash', {
    responseMimeType: 'application/json',
    temperature: 0.3,
  });

  const result = await model.generateContent(prompt);
  const content = result.response.text();
  const parsed = JSON.parse(content);

  return parsed.summary || analysis.summary;
}

/**
 * Main function: Process document based on generation mode
 */
export async function processDocumentWithAI(
  document: ExtractedDocument,
  mode: AIGenerationMode,
  options: {
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    questionTypes?: ('mcq' | 'essay' | 'fill_blank' | 'matching')[];
    targetGrade?: number;
    duration?: number;
  }
): Promise<AIGeneratedContent> {
  // First, analyze the document
  const analysis = await analyzeDocument(document);

  // Then generate content based on mode
  let generatedContent: AIGeneratedContent = {
    id: uuidv4(),
    documentId: document.id,
    analysisId: analysis.id,
    contentType: 'questions',
    createdAt: new Date().toISOString(),
  };

  switch (mode) {
    case 'create_assignment':
    case 'create_test':
    case 'create_question_bank':
      const questions = await generateQuestionsFromDocument(document, analysis, {
        count: options.questionCount || 10,
        difficulty: options.difficulty || 'mixed',
        types: options.questionTypes || ['mcq', 'essay'],
        targetGrade: options.targetGrade,
      });
      generatedContent.contentType = mode === 'create_question_bank' ? 'quiz' : 'questions';
      generatedContent.questions = questions;
      break;

    case 'create_lesson':
      const lessonOutline = await generateLessonPlan(document, analysis, {
        duration: options.duration || 45,
        targetGrade: options.targetGrade,
      });
      generatedContent.contentType = 'lesson_plan';
      generatedContent.lessonOutline = lessonOutline;
      break;

    case 'create_study_material':
      const studyGuide = await generateStudyGuide(document, analysis);
      generatedContent.contentType = 'study_guide';
      generatedContent.studyGuide = studyGuide;
      break;

    case 'create_audio_lecture':
      // Will be implemented in Phase 3 with OpenAI TTS
      const summary = await generateSummary(document, analysis, { length: 'long' });
      generatedContent.contentType = 'summary';
      generatedContent.summaryText = summary;
      break;
  }

  return generatedContent;
}
