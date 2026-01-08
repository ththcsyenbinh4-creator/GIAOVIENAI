import { NextRequest, NextResponse } from 'next/server';
import { GeneratedQuestion, GenerateQuestionsRequest } from '@/types/domain';
import { getGeminiModel } from '@/lib/gemini';

/**
 * POST /api/mock/ai/generate-questions
 *
 * AI endpoint for generating questions using OpenAI.
 *
 * Body: GenerateQuestionsRequest
 * {
 *   topic: string,
 *   difficulty: 'easy' | 'medium' | 'hard',
 *   numberOfQuestions: number,
 *   questionType?: 'mcq' | 'essay' | 'mixed'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json();

    // Validate request
    if (!body.topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!body.numberOfQuestions || body.numberOfQuestions < 1 || body.numberOfQuestions > 20) {
      return NextResponse.json(
        { success: false, error: 'numberOfQuestions must be between 1 and 20' },
        { status: 400 }
      );
    }

    const difficulty = body.difficulty || 'medium';
    const questionType = body.questionType || 'mixed';
    const count = body.numberOfQuestions;

    // Check if real AI is enabled and Gemini API key is configured
    const useRealAI = process.env.USE_REAL_AI === 'true';
    const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

    if (!useRealAI || !hasGeminiKey) {
      if (!useRealAI) {
        console.log('USE_REAL_AI=false, using mock questions');
      } else {
        console.warn('Gemini API key not configured, falling back to mock data');
      }
      const questions = generateMockQuestions(body.topic, difficulty, count, questionType);
      return NextResponse.json({
        success: true,
        data: {
          questions,
          meta: {
            topic: body.topic,
            difficulty,
            requestedCount: count,
            generatedCount: questions.length,
            source: 'mock',
          },
        },
      });
    }

    // Generate questions using Gemini
    const questions = await generateQuestionsWithGemini(body.topic, difficulty, count, questionType);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        meta: {
          topic: body.topic,
          difficulty,
          requestedCount: count,
          generatedCount: questions.length,
          source: 'gemini',
        },
      },
    });
  } catch (error) {
    console.error('Error generating questions:', error);

    // If AI fails, fall back to mock data
    try {
      const body: GenerateQuestionsRequest = await request.clone().json();
      const questions = generateMockQuestions(
        body.topic || 'General',
        body.difficulty || 'medium',
        body.numberOfQuestions || 5,
        body.questionType || 'mixed'
      );
      return NextResponse.json({
        success: true,
        data: {
          questions,
          meta: {
            topic: body.topic,
            difficulty: body.difficulty,
            requestedCount: body.numberOfQuestions,
            generatedCount: questions.length,
            source: 'mock-fallback',
          },
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Failed to generate questions' },
        { status: 500 }
      );
    }
  }
}

/**
 * Generate questions using Gemini API
 */
async function generateQuestionsWithGemini(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number,
  questionType: 'mcq' | 'essay' | 'mixed'
): Promise<GeneratedQuestion[]> {
  const difficultyVi = {
    easy: 'dễ',
    medium: 'trung bình',
    hard: 'khó',
  };

  const typeInstruction = questionType === 'mcq'
    ? 'Tất cả câu hỏi phải là trắc nghiệm (mcq).'
    : questionType === 'essay'
      ? 'Tất cả câu hỏi phải là tự luận (essay).'
      : `Khoảng ${Math.floor(count * 0.7)} câu trắc nghiệm (mcq) và ${Math.ceil(count * 0.3)} câu tự luận (essay).`;

  const systemPrompt = `Bạn là một giáo viên giỏi, chuyên tạo câu hỏi kiểm tra cho học sinh Việt Nam.
Bạn tạo câu hỏi chất lượng cao, rõ ràng, chính xác về ngữ pháp và nội dung.
Luôn trả về JSON hợp lệ theo format yêu cầu.`;

  const userPrompt = `Tạo ${count} câu hỏi về chủ đề: "${topic}"

Yêu cầu:
- Độ khó: ${difficultyVi[difficulty]}
- ${typeInstruction}
- Câu hỏi phải bằng tiếng Việt
- Nội dung phù hợp với chương trình giáo dục Việt Nam

Điểm số:
- Câu trắc nghiệm dễ: 0.5 điểm
- Câu trắc nghiệm trung bình: 1 điểm
- Câu trắc nghiệm khó: 1.5 điểm
- Câu tự luận: gấp đôi điểm trắc nghiệm cùng độ khó

Trả về JSON array với format sau (KHÔNG có text khác ngoài JSON):
[
  {
    "type": "mcq",
    "prompt": "Nội dung câu hỏi",
    "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswerIndex": 0,
    "maxScore": 1
  },
  {
    "type": "essay",
    "prompt": "Nội dung câu hỏi tự luận",
    "maxScore": 2
  }
]`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const model = getGeminiModel('gemini-1.5-flash', {
    responseMimeType: 'application/json',
    temperature: 0.7,
  });

  const result = await model.generateContent(fullPrompt);
  const content = result.response.text();

  // Extract JSON from response if needed (though responseMimeType usually handles it)
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    // Try parsing full content if no array brackets found (sometimes it wraps in object)
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as GeneratedQuestion[]; // TODO: map properly
      // If it's wrapped in { questions: [] }
      if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions.map((q: any) => ({
        type: q.type,
        prompt: q.prompt,
        choices: q.type === 'mcq' ? q.choices : undefined,
        correctAnswerIndex: q.type === 'mcq' ? q.correctAnswerIndex : undefined,
        maxScore: q.maxScore || (q.type === 'mcq' ? 1 : 2),
        source: 'ai' as const,
      }));
    } catch { }
    throw new Error('No JSON array found in response');
  }

  const parsedQuestions = JSON.parse(jsonMatch[0]) as Array<{
    type: 'mcq' | 'essay';
    prompt: string;
    choices?: string[];
    correctAnswerIndex?: number;
    maxScore: number;
  }>;

  // Transform and validate questions
  const questions: GeneratedQuestion[] = parsedQuestions.map((q) => ({
    type: q.type,
    prompt: q.prompt,
    choices: q.type === 'mcq' ? q.choices : undefined,
    correctAnswerIndex: q.type === 'mcq' ? q.correctAnswerIndex : undefined,
    maxScore: q.maxScore || (q.type === 'mcq' ? 1 : 2),
    source: 'ai' as const,
  }));

  return questions;
}

/**
 * Fallback mock question generator
 */
function generateMockQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number,
  questionType: 'mcq' | 'essay' | 'mixed'
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const baseScore = difficulty === 'easy' ? 0.5 : difficulty === 'medium' ? 1 : 1.5;

  const mcqTemplates = [
    {
      prompt: `Theo định nghĩa về ${topic}, đáp án nào sau đây là đúng?`,
      choices: [
        'Đáp án A - chính xác theo định nghĩa',
        'Đáp án B - sai vì thiếu điều kiện',
        'Đáp án C - sai vì áp dụng nhầm công thức',
        'Đáp án D - sai vì đảo ngược điều kiện',
      ],
      correctAnswerIndex: 0,
    },
    {
      prompt: `Khi giải bài toán liên quan đến ${topic}, bước đầu tiên cần làm là gì?`,
      choices: [
        'Xác định dữ kiện và yêu cầu bài toán',
        'Áp dụng ngay công thức',
        'Vẽ hình minh họa',
        'Tính toán ngay kết quả',
      ],
      correctAnswerIndex: 0,
    },
    {
      prompt: `Cho biết ${topic} có đặc điểm nào sau đây?`,
      choices: [
        'Đặc điểm A - thuộc tính cơ bản',
        'Đặc điểm B - chỉ đúng trong trường hợp đặc biệt',
        'Đặc điểm C - không liên quan',
        'Đặc điểm D - đặc điểm của khái niệm khác',
      ],
      correctAnswerIndex: 0,
    },
  ];

  const essayTemplates = [
    { prompt: `Trình bày khái niệm về ${topic}. Cho ví dụ minh họa và giải thích.` },
    { prompt: `Giải bài toán sau liên quan đến ${topic}. Trình bày đầy đủ các bước giải.` },
    { prompt: `So sánh và chỉ ra mối liên hệ giữa ${topic} với các khái niệm đã học trước đó.` },
  ];

  for (let i = 0; i < count; i++) {
    const shouldBeMcq =
      questionType === 'mcq' ||
      (questionType === 'mixed' && (i < count * 0.7 || Math.random() > 0.3));

    if (shouldBeMcq) {
      const template = mcqTemplates[i % mcqTemplates.length];
      questions.push({
        type: 'mcq',
        prompt: template.prompt,
        choices: template.choices,
        correctAnswerIndex: template.correctAnswerIndex,
        maxScore: baseScore,
        source: 'ai',
      });
    } else {
      const template = essayTemplates[i % essayTemplates.length];
      questions.push({
        type: 'essay',
        prompt: template.prompt,
        maxScore: baseScore * 2,
        source: 'ai',
      });
    }
  }

  return questions;
}
