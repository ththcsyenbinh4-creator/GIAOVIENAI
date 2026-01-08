import { createCompletion, parseJSONResponse } from './client';
import { SYSTEM_PROMPTS, getQuestionGenerationPrompt } from './prompts';
import {
  QuestionGenerationRequest,
  QuestionGenerationResult,
  GeneratedQuestion,
  StreamingOptions,
} from './types';

// Generate questions based on topic and requirements
export async function generateQuestions(
  request: QuestionGenerationRequest,
  streaming?: StreamingOptions
): Promise<QuestionGenerationResult> {
  const startTime = Date.now();

  const userPrompt = getQuestionGenerationPrompt({
    topic: request.topic,
    gradeLevel: request.gradeLevel,
    subject: request.subject,
    questionCount: request.questionCount,
    questionTypes: request.questionTypes,
    difficulty: request.difficulty,
    context: request.context,
  });

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.questionGeneration,
    userPrompt,
    streaming,
  });

  const parsed = parseJSONResponse<{ questions: GeneratedQuestion[] }>(response);

  // Add unique IDs
  const questions = parsed.questions.map((q, index) => ({
    ...q,
    id: `gen-${Date.now()}-${index + 1}`,
  }));

  return {
    questions,
    metadata: {
      topic: request.topic,
      gradeLevel: request.gradeLevel,
      generatedAt: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    },
  };
}

// Generate a single question
export async function generateSingleQuestion(params: {
  topic: string;
  gradeLevel: string;
  subject: string;
  type: 'single' | 'multiple' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard';
  context?: string;
}): Promise<GeneratedQuestion> {
  const result = await generateQuestions({
    topic: params.topic,
    gradeLevel: params.gradeLevel,
    subject: params.subject,
    questionCount: 1,
    questionTypes: [params.type],
    difficulty: params.difficulty,
    context: params.context,
  });

  return result.questions[0];
}

// Generate questions with difficulty distribution
export async function generateBalancedQuestions(params: {
  topic: string;
  gradeLevel: string;
  subject: string;
  totalQuestions: number;
  questionTypes: ('single' | 'multiple' | 'essay')[];
  context?: string;
}): Promise<QuestionGenerationResult> {
  const { totalQuestions, ...rest } = params;

  // Calculate distribution: 30% easy, 50% medium, 20% hard
  const easyCount = Math.floor(totalQuestions * 0.3);
  const hardCount = Math.floor(totalQuestions * 0.2);
  const mediumCount = totalQuestions - easyCount - hardCount;

  // Generate questions for each difficulty level
  const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
    generateQuestions({
      ...rest,
      questionCount: easyCount,
      difficulty: 'easy',
    }),
    generateQuestions({
      ...rest,
      questionCount: mediumCount,
      difficulty: 'medium',
    }),
    generateQuestions({
      ...rest,
      questionCount: hardCount,
      difficulty: 'hard',
    }),
  ]);

  // Combine and shuffle questions
  const allQuestions = [
    ...easyQuestions.questions,
    ...mediumQuestions.questions,
    ...hardQuestions.questions,
  ];

  // Shuffle array
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return {
    questions: allQuestions,
    metadata: {
      topic: params.topic,
      gradeLevel: params.gradeLevel,
      generatedAt: new Date().toISOString(),
      processingTime:
        easyQuestions.metadata.processingTime +
        mediumQuestions.metadata.processingTime +
        hardQuestions.metadata.processingTime,
    },
  };
}

// Improve an existing question
export async function improveQuestion(
  question: GeneratedQuestion,
  feedback: string
): Promise<GeneratedQuestion> {
  const userPrompt = `Cải thiện câu hỏi sau dựa trên phản hồi:

CÂU HỎI HIỆN TẠI:
${JSON.stringify(question, null, 2)}

PHẢN HỒI:
${feedback}

Trả về câu hỏi đã cải thiện với cùng format JSON.`;

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.questionGeneration,
    userPrompt,
  });

  const improved = parseJSONResponse<GeneratedQuestion>(response);

  return {
    ...improved,
    id: question.id, // Keep original ID
  };
}

// Generate similar questions (for question bank expansion)
export async function generateSimilarQuestions(
  originalQuestion: GeneratedQuestion,
  count: number = 3
): Promise<GeneratedQuestion[]> {
  const userPrompt = `Tạo ${count} câu hỏi tương tự với câu hỏi sau (cùng chủ đề, độ khó, nhưng khác nội dung):

CÂU HỎI MẪU:
${JSON.stringify(originalQuestion, null, 2)}

Trả về dưới dạng JSON array với format giống câu hỏi mẫu.`;

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.questionGeneration,
    userPrompt,
  });

  const questions = parseJSONResponse<GeneratedQuestion[]>(response);

  return questions.map((q, index) => ({
    ...q,
    id: `similar-${originalQuestion.id}-${index + 1}`,
  }));
}

// Validate question quality
export async function validateQuestion(question: GeneratedQuestion): Promise<{
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const userPrompt = `Kiểm tra chất lượng câu hỏi sau:

${JSON.stringify(question, null, 2)}

Đánh giá các tiêu chí:
1. Câu hỏi rõ ràng, không mơ hồ
2. Đáp án đúng chính xác
3. Các đáp án nhiễu hợp lý (nếu là trắc nghiệm)
4. Rubric đầy đủ (nếu là tự luận)
5. Độ khó phù hợp

Trả về JSON:
{
  "isValid": true/false,
  "issues": ["Vấn đề 1", ...],
  "suggestions": ["Gợi ý cải thiện 1", ...]
}`;

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.questionGeneration,
    userPrompt,
  });

  return parseJSONResponse<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>(response);
}
