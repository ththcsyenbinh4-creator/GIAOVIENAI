/**
 * Worksheet Generation API
 *
 * POST /api/worksheets/generate
 * Generates worksheets with various question types from lesson content using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  WorksheetGenerateRequest,
  Worksheet,
  WorksheetQuestion,
  WorksheetQuestionType,
} from '@/types/domain';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maximum content length
const MAX_CONTENT_LENGTH = 6000;

// Worksheet generation system prompt
const SYSTEM_PROMPT = `Bạn là một chuyên gia tạo bài tập (worksheet) cho giáo viên Việt Nam.
Nhiệm vụ của bạn là tạo bài tập đa dạng từ nội dung bài học được cung cấp.

LOẠI CÂU HỎI CÓ THỂ TẠO:
1. fill-blank: Điền vào chỗ trống - Câu có ___blank___ để học sinh điền
2. matching: Nối cột - Ghép các cặp tương ứng
3. true-false: Đúng/Sai - Phát biểu để xác định đúng hay sai
4. short-answer: Trả lời ngắn - Câu hỏi cần câu trả lời ngắn gọn
5. ordering: Sắp xếp - Đưa các mục về thứ tự đúng
6. mcq: Trắc nghiệm - Chọn đáp án đúng từ các lựa chọn

QUY TẮC TẠO BÀI TẬP:
1. Câu hỏi rõ ràng, không gây hiểu nhầm
2. Đáp án chính xác và có cơ sở
3. Mức độ khó phù hợp với lớp học
4. Phân bố điểm hợp lý
5. Thêm giải thích cho từng câu hỏi
6. Đa dạng loại câu hỏi

OUTPUT FORMAT:
Trả về JSON với cấu trúc Worksheet. Không thêm markdown code block, chỉ JSON thuần.`;

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Tính năng tạo bài tập chưa được cấu hình. Vui lòng liên hệ quản trị viên.' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: WorksheetGenerateRequest = await request.json();
    const {
      mode,
      title,
      gradeLevel,
      subject,
      content,
      targetQuestionCount = 10,
      questionTypes,
      difficulty = 'mixed',
    } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên bài tập' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Không có nội dung để tạo bài tập' },
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

    // Validate question count
    const questionCount = Math.max(5, Math.min(20, targetQuestionCount));

    // Build user prompt
    const userPrompt = buildUserPrompt({
      mode,
      title,
      gradeLevel,
      subject,
      content,
      questionCount,
      questionTypes,
      difficulty,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: 'Không nhận được phản hồi từ AI' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsedWorksheet: Worksheet;
    try {
      const parsed = JSON.parse(responseText);
      parsedWorksheet = normalizeWorksheet(parsed, title, gradeLevel, subject);
    } catch {
      console.error('Failed to parse worksheet JSON:', responseText);
      return NextResponse.json(
        { error: 'Không thể xử lý kết quả từ AI. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ worksheet: parsedWorksheet });
  } catch (error) {
    console.error('Worksheet generation error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Lỗi xác thực OpenAI API. Vui lòng kiểm tra API key.' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Không thể tạo bài tập. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

/**
 * Build user prompt for worksheet generation
 */
function buildUserPrompt(params: {
  mode: string;
  title: string;
  gradeLevel?: string;
  subject?: string;
  content: string;
  questionCount: number;
  questionTypes?: WorksheetQuestionType[];
  difficulty: string;
}): string {
  const { mode, title, gradeLevel, subject, content, questionCount, questionTypes, difficulty } = params;

  let modeDescription = 'nội dung bài học';
  if (mode === 'from-lesson-plan') {
    modeDescription = 'kế hoạch bài giảng';
  } else if (mode === 'from-study-guide') {
    modeDescription = 'tài liệu ôn tập';
  }

  let contextInfo = `Tên bài tập: ${title}`;
  if (gradeLevel) contextInfo += `\nKhối lớp: ${gradeLevel}`;
  if (subject) contextInfo += `\nMôn học: ${subject}`;

  let difficultyInstruction = '';
  if (difficulty === 'easy') {
    difficultyInstruction = 'Tất cả câu hỏi ở mức dễ (nhận biết, nhớ lại)';
  } else if (difficulty === 'medium') {
    difficultyInstruction = 'Tất cả câu hỏi ở mức trung bình (thông hiểu, vận dụng)';
  } else if (difficulty === 'hard') {
    difficultyInstruction = 'Tất cả câu hỏi ở mức khó (phân tích, đánh giá, sáng tạo)';
  } else {
    difficultyInstruction = 'Pha trộn các mức độ khó: 30% dễ, 50% trung bình, 20% khó';
  }

  let typesInstruction = 'Sử dụng đa dạng các loại câu hỏi';
  if (questionTypes && questionTypes.length > 0) {
    const typeNames: Record<WorksheetQuestionType, string> = {
      'fill-blank': 'điền chỗ trống',
      'matching': 'nối cột',
      'true-false': 'đúng/sai',
      'short-answer': 'trả lời ngắn',
      'ordering': 'sắp xếp',
      'mcq': 'trắc nghiệm',
    };
    const requestedTypes = questionTypes.map(t => typeNames[t]).join(', ');
    typesInstruction = `Chỉ sử dụng các loại câu hỏi: ${requestedTypes}`;
  }

  return `Tạo bài tập (worksheet) từ ${modeDescription} sau:

${contextInfo}

NỘI DUNG:
${content}

YÊU CẦU:
- Tạo ${questionCount} câu hỏi
- ${difficultyInstruction}
- ${typesInstruction}
- Mỗi câu hỏi có điểm số hợp lý (tổng điểm = 100)
- Thêm giải thích (explanation) cho từng câu
- Sử dụng ngôn ngữ phù hợp với học sinh${gradeLevel ? ` lớp ${gradeLevel}` : ''}

Trả về JSON với cấu trúc:
{
  "questions": [
    {
      "id": "q-1",
      "type": "fill-blank|matching|true-false|short-answer|ordering|mcq",
      "order": 1,
      "points": 10,
      "question": "Nội dung câu hỏi",

      // Cho fill-blank:
      "blanks": ["đáp án cho chỗ trống 1", "đáp án cho chỗ trống 2"],

      // Cho matching:
      "matchingPairs": [{"left": "A", "right": "1"}, {"left": "B", "right": "2"}],

      // Cho true-false:
      "isTrue": true|false,

      // Cho short-answer:
      "expectedAnswer": "Đáp án mong đợi",

      // Cho ordering:
      "orderItems": ["Mục 1 đúng thứ tự", "Mục 2", "Mục 3"],

      // Cho mcq:
      "choices": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswerIndex": 0,

      "explanation": "Giải thích đáp án"
    }
  ],
  "instructions": "Hướng dẫn làm bài",
  "description": "Mô tả bài tập",
  "estimatedMinutes": 30
}`;
}

/**
 * Normalize and validate worksheet from AI response
 */
function normalizeWorksheet(
  parsed: Record<string, unknown>,
  title: string,
  gradeLevel?: string,
  subject?: string
): Worksheet {
  const questions: WorksheetQuestion[] = [];
  const worksheet = parsed.worksheet as Record<string, unknown> | undefined;
  const rawQuestions = (parsed.questions || worksheet?.questions || []) as Record<string, unknown>[];

  let totalPoints = 0;

  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i];

    // Validate question type
    const type = validateQuestionType(raw.type as string);
    const points = Number(raw.points) || 10;
    totalPoints += points;

    const question: WorksheetQuestion = {
      id: (raw.id as string) || `q-${i + 1}`,
      type,
      order: Number(raw.order) || i + 1,
      points,
      question: String(raw.question || ''),
      explanation: raw.explanation ? String(raw.explanation) : undefined,
    };

    // Add type-specific fields
    switch (type) {
      case 'fill-blank':
        if (Array.isArray(raw.blanks)) {
          question.blanks = raw.blanks.map((b: unknown) => String(b));
        }
        break;
      case 'matching':
        if (Array.isArray(raw.matchingPairs)) {
          question.matchingPairs = (raw.matchingPairs as Record<string, unknown>[]).map(pair => ({
            left: String(pair.left || ''),
            right: String(pair.right || ''),
          }));
        }
        break;
      case 'true-false':
        question.isTrue = Boolean(raw.isTrue);
        break;
      case 'short-answer':
        question.expectedAnswer = raw.expectedAnswer ? String(raw.expectedAnswer) : undefined;
        break;
      case 'ordering':
        if (Array.isArray(raw.orderItems)) {
          question.orderItems = raw.orderItems.map((item: unknown) => String(item));
        }
        break;
      case 'mcq':
        if (Array.isArray(raw.choices)) {
          question.choices = raw.choices.map((c: unknown) => String(c));
        }
        question.correctAnswerIndex = typeof raw.correctAnswerIndex === 'number'
          ? raw.correctAnswerIndex
          : 0;
        break;
    }

    questions.push(question);
  }

  return {
    id: `worksheet-${Date.now()}`,
    title,
    description: parsed.description ? String(parsed.description) : undefined,
    subject,
    gradeLevel,
    instructions: parsed.instructions ? String(parsed.instructions) : undefined,
    totalPoints,
    estimatedMinutes: typeof parsed.estimatedMinutes === 'number' ? parsed.estimatedMinutes : 30,
    questions,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate and normalize question type
 */
function validateQuestionType(type: string | undefined): WorksheetQuestionType {
  const validTypes: WorksheetQuestionType[] = [
    'fill-blank',
    'matching',
    'true-false',
    'short-answer',
    'ordering',
    'mcq',
  ];
  if (type && validTypes.includes(type as WorksheetQuestionType)) {
    return type as WorksheetQuestionType;
  }
  return 'short-answer';
}
