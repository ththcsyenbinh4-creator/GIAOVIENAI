import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  Lesson,
  LessonStep,
  LessonGenerateRequest,
  LessonStepType,
  SlideDeck,
  FlashcardDeck,
  Worksheet,
} from '@/types/domain';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default lesson templates
const DEFAULT_45_MIN_STRUCTURE: Array<{ type: LessonStepType; title: string; duration: number }> = [
  { type: 'intro', title: 'Giới thiệu bài học', duration: 3 },
  { type: 'slide', title: 'Nội dung chính', duration: 15 },
  { type: 'flashcard', title: 'Ôn tập kiến thức', duration: 7 },
  { type: 'worksheet', title: 'Bài tập thực hành', duration: 12 },
  { type: 'discussion', title: 'Thảo luận & Hỏi đáp', duration: 5 },
  { type: 'summary', title: 'Tổng kết bài học', duration: 3 },
];

const DEFAULT_30_MIN_STRUCTURE: Array<{ type: LessonStepType; title: string; duration: number }> = [
  { type: 'intro', title: 'Giới thiệu', duration: 2 },
  { type: 'slide', title: 'Nội dung chính', duration: 12 },
  { type: 'flashcard', title: 'Ôn tập nhanh', duration: 5 },
  { type: 'worksheet', title: 'Bài tập', duration: 8 },
  { type: 'summary', title: 'Tổng kết', duration: 3 },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getDefaultStructure(duration: number): Array<{ type: LessonStepType; title: string; duration: number }> {
  if (duration <= 30) return DEFAULT_30_MIN_STRUCTURE;
  return DEFAULT_45_MIN_STRUCTURE;
}

export async function POST(request: Request) {
  try {
    const body: LessonGenerateRequest = await request.json();

    const {
      mode,
      title,
      subject,
      gradeLevel,
      targetDuration = 45,
      content,
      includeSlides = true,
      includeAudio = false,
      includeFlashcards = true,
      includeWorksheet = true,
      includeHomework = false,
      objectives,
      customSteps,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Thiếu tiêu đề bài học' }, { status: 400 });
    }

    // Get base structure
    const baseStructure = customSteps && customSteps.length > 0
      ? customSteps.map(step => ({
          type: step.type,
          title: step.title || getDefaultTitleForType(step.type),
          duration: step.duration || getDefaultDurationForType(step.type),
        }))
      : getDefaultStructure(targetDuration);

    // Filter structure based on include flags
    const filteredStructure = baseStructure.filter(step => {
      if (step.type === 'slide' && !includeSlides) return false;
      if (step.type === 'audio' && !includeAudio) return false;
      if (step.type === 'flashcard' && !includeFlashcards) return false;
      if (step.type === 'worksheet' && !includeWorksheet) return false;
      if (step.type === 'homework' && !includeHomework) return false;
      return true;
    });

    // Generate lesson content using AI
    const lessonContent = await generateLessonContent({
      title,
      subject,
      gradeLevel,
      content,
      structure: filteredStructure,
      objectives,
    });

    // Build lesson steps
    const steps: LessonStep[] = filteredStructure.map((stepDef, index) => {
      const stepId = generateId();
      const baseStep: LessonStep = {
        id: stepId,
        type: stepDef.type,
        title: stepDef.title,
        durationMinutes: stepDef.duration,
        order: index,
        isCompleted: false,
      };

      // Add content based on step type
      switch (stepDef.type) {
        case 'intro':
          return {
            ...baseStep,
            description: lessonContent.intro?.description,
            notes: lessonContent.intro?.notes,
          };

        case 'slide':
          return {
            ...baseStep,
            slideDeck: lessonContent.slideDeck,
          };

        case 'flashcard':
          return {
            ...baseStep,
            flashcardDeck: lessonContent.flashcardDeck,
          };

        case 'worksheet':
          return {
            ...baseStep,
            worksheet: lessonContent.worksheet,
          };

        case 'discussion':
          return {
            ...baseStep,
            description: lessonContent.discussion?.description,
            instructions: lessonContent.discussion?.questions?.join('\n'),
          };

        case 'summary':
          return {
            ...baseStep,
            description: lessonContent.summary?.keyPoints?.join('\n'),
            notes: lessonContent.summary?.notes,
          };

        case 'homework':
          return {
            ...baseStep,
            description: lessonContent.homework?.description,
            instructions: lessonContent.homework?.tasks?.join('\n'),
          };

        default:
          return baseStep;
      }
    });

    // Calculate total duration
    const totalDuration = steps.reduce((sum, step) => sum + step.durationMinutes, 0);

    // Build final lesson
    const lesson: Lesson = {
      id: generateId(),
      title,
      description: lessonContent.description,
      subject,
      gradeLevel,
      totalDurationMinutes: totalDuration,
      steps,
      objectives: lessonContent.objectives || objectives,
      prerequisites: lessonContent.prerequisites,
      materials: lessonContent.materials,
      status: 'draft',
      currentStepIndex: 0,
      teacherNotes: lessonContent.teacherNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error generating lesson:', error);
    return NextResponse.json(
      { error: 'Không thể tạo bài giảng. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

function getDefaultTitleForType(type: LessonStepType): string {
  const titles: Record<LessonStepType, string> = {
    intro: 'Giới thiệu',
    slide: 'Nội dung chính',
    audio: 'Giảng giải audio',
    flashcard: 'Ôn tập flashcard',
    worksheet: 'Bài tập',
    discussion: 'Thảo luận',
    break: 'Nghỉ giải lao',
    summary: 'Tổng kết',
    homework: 'Bài về nhà',
  };
  return titles[type] || type;
}

function getDefaultDurationForType(type: LessonStepType): number {
  const durations: Record<LessonStepType, number> = {
    intro: 3,
    slide: 15,
    audio: 5,
    flashcard: 7,
    worksheet: 10,
    discussion: 5,
    break: 5,
    summary: 3,
    homework: 2,
  };
  return durations[type] || 5;
}

interface GeneratedLessonContent {
  description?: string;
  objectives?: string[];
  prerequisites?: string[];
  materials?: string[];
  teacherNotes?: string;
  intro?: {
    description?: string;
    notes?: string;
  };
  slideDeck?: SlideDeck;
  flashcardDeck?: FlashcardDeck;
  worksheet?: Worksheet;
  discussion?: {
    description?: string;
    questions?: string[];
  };
  summary?: {
    keyPoints?: string[];
    notes?: string;
  };
  homework?: {
    description?: string;
    tasks?: string[];
  };
}

async function generateLessonContent(params: {
  title: string;
  subject?: string;
  gradeLevel?: string;
  content?: string;
  structure: Array<{ type: LessonStepType; title: string; duration: number }>;
  objectives?: string[];
}): Promise<GeneratedLessonContent> {
  const { title, subject, gradeLevel, content, structure, objectives } = params;

  const hasSlides = structure.some(s => s.type === 'slide');
  const hasFlashcards = structure.some(s => s.type === 'flashcard');
  const hasWorksheet = structure.some(s => s.type === 'worksheet');
  const hasDiscussion = structure.some(s => s.type === 'discussion');
  const hasHomework = structure.some(s => s.type === 'homework');

  const systemPrompt = `Bạn là chuyên gia thiết kế bài giảng giáo dục Việt Nam. Nhiệm vụ của bạn là tạo nội dung bài giảng hoàn chỉnh theo cấu trúc được yêu cầu.

Trả về JSON với cấu trúc sau:
{
  "description": "Mô tả ngắn về bài học",
  "objectives": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
  "prerequisites": ["Kiến thức cần có trước"],
  "materials": ["Dụng cụ/tài liệu cần chuẩn bị"],
  "teacherNotes": "Ghi chú cho giáo viên",
  "intro": {
    "description": "Nội dung giới thiệu bài học",
    "notes": "Ghi chú cách giới thiệu"
  }${hasSlides ? `,
  "slideDeck": {
    "slides": [
      {
        "title": "Tiêu đề slide",
        "blocks": [
          { "type": "title", "text": "..." },
          { "type": "bullet-list", "items": ["...", "..."] },
          { "type": "key-point", "text": "..." }
        ],
        "notesForTeacher": "Ghi chú"
      }
    ]
  }` : ''}${hasFlashcards ? `,
  "flashcardDeck": {
    "cards": [
      {
        "front": "Câu hỏi/khái niệm",
        "back": "Đáp án/giải thích",
        "hint": "Gợi ý (optional)",
        "difficulty": "easy|medium|hard",
        "category": "Chủ đề"
      }
    ]
  }` : ''}${hasWorksheet ? `,
  "worksheet": {
    "instructions": "Hướng dẫn làm bài",
    "questions": [
      {
        "type": "mcq|fill-blank|true-false|short-answer|matching|ordering",
        "question": "Câu hỏi",
        "points": 1,
        "choices": ["A", "B", "C", "D"],
        "correctAnswerIndex": 0,
        "explanation": "Giải thích"
      }
    ]
  }` : ''}${hasDiscussion ? `,
  "discussion": {
    "description": "Hướng dẫn thảo luận",
    "questions": ["Câu hỏi thảo luận 1", "Câu hỏi thảo luận 2"]
  }` : ''},
  "summary": {
    "keyPoints": ["Điểm chính 1", "Điểm chính 2"],
    "notes": "Cách tổng kết"
  }${hasHomework ? `,
  "homework": {
    "description": "Mô tả bài về nhà",
    "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"]
  }` : ''}
}

Lưu ý:
- Nội dung phải phù hợp với ${gradeLevel || 'cấp học'} môn ${subject || 'học'}
- Ngôn ngữ rõ ràng, dễ hiểu
- Slide blocks có thể dùng: title, subtitle, paragraph, bullet-list, numbered-list, quote, exercise, key-point
- Flashcard difficulty: easy (nhận biết), medium (thông hiểu), hard (vận dụng)
- Worksheet question types: mcq, fill-blank, true-false, short-answer, matching, ordering`;

  const userPrompt = `Tạo bài giảng hoàn chỉnh cho:
- Tiêu đề: ${title}
- Môn học: ${subject || 'Không xác định'}
- Cấp lớp: ${gradeLevel || 'Không xác định'}
${content ? `- Nội dung nguồn:\n${content.substring(0, 3000)}` : ''}
${objectives ? `- Mục tiêu mong muốn:\n${objectives.join('\n')}` : ''}

Cấu trúc bài học:
${structure.map((s, i) => `${i + 1}. ${s.title} (${s.type}) - ${s.duration} phút`).join('\n')}

Hãy tạo nội dung đầy đủ, chất lượng cao cho từng phần.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    // Normalize the response
    const result: GeneratedLessonContent = {
      description: parsed.description,
      objectives: parsed.objectives,
      prerequisites: parsed.prerequisites,
      materials: parsed.materials,
      teacherNotes: parsed.teacherNotes,
      intro: parsed.intro,
      discussion: parsed.discussion,
      summary: parsed.summary,
      homework: parsed.homework,
    };

    // Process slide deck
    if (parsed.slideDeck?.slides) {
      result.slideDeck = {
        id: generateId(),
        lessonTitle: title,
        subject,
        gradeLevel,
        slides: parsed.slideDeck.slides.map((slide: Record<string, unknown>, index: number) => ({
          id: generateId(),
          title: slide.title as string,
          blocks: slide.blocks || [],
          notesForTeacher: slide.notesForTeacher as string,
          layout: 'default',
        })),
        createdAt: new Date().toISOString(),
      };
    }

    // Process flashcard deck
    if (parsed.flashcardDeck?.cards) {
      result.flashcardDeck = {
        id: generateId(),
        title: `Flashcards - ${title}`,
        subject,
        gradeLevel,
        cards: parsed.flashcardDeck.cards.map((card: Record<string, unknown>) => ({
          id: generateId(),
          front: card.front as string,
          back: card.back as string,
          hint: card.hint as string,
          difficulty: card.difficulty || 'medium',
          category: card.category as string,
        })),
        createdAt: new Date().toISOString(),
      };
    }

    // Process worksheet
    if (parsed.worksheet?.questions) {
      const questions = parsed.worksheet.questions.map((q: Record<string, unknown>, index: number) => ({
        id: generateId(),
        type: q.type || 'mcq',
        order: index,
        points: q.points || 1,
        question: q.question as string,
        choices: q.choices,
        correctAnswerIndex: q.correctAnswerIndex,
        blanks: q.blanks,
        matchingPairs: q.matchingPairs,
        isTrue: q.isTrue,
        expectedAnswer: q.expectedAnswer,
        orderItems: q.orderItems,
        explanation: q.explanation as string,
      }));

      result.worksheet = {
        id: generateId(),
        title: `Bài tập - ${title}`,
        subject,
        gradeLevel,
        instructions: parsed.worksheet.instructions,
        totalPoints: questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0),
        questions,
        createdAt: new Date().toISOString(),
      };
    }

    return result;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Return minimal content on error
    return {
      description: `Bài giảng về ${title}`,
      objectives: objectives || [`Hiểu được nội dung chính của ${title}`],
      intro: {
        description: `Giới thiệu về ${title}`,
      },
      summary: {
        keyPoints: [`Nội dung chính của ${title}`],
      },
    };
  }
}
