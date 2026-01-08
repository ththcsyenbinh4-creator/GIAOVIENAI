import { createCompletion, parseJSONResponse } from './client';
import { SYSTEM_PROMPTS, getEssayGradingPrompt } from './prompts';
import {
  EssayGradingRequest,
  EssayGradingResult,
  BatchEssayGradingRequest,
  BatchEssayGradingResult,
  EssayFeedback,
  RubricScore,
  StreamingOptions,
} from './types';

// Grade a single essay
export async function gradeEssay(
  request: EssayGradingRequest,
  streaming?: StreamingOptions
): Promise<EssayGradingResult> {
  const startTime = Date.now();

  const userPrompt = getEssayGradingPrompt({
    questionContent: request.questionContent,
    studentAnswer: request.studentAnswer,
    rubric: request.rubric,
    maxPoints: request.maxPoints,
  });

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.essayGrading,
    userPrompt,
    config: {
      temperature: 0.3, // Lower temperature for more consistent grading
    },
    streaming,
  });

  const parsed = parseJSONResponse<{
    suggestedScore: number;
    confidence: number;
    feedback: EssayFeedback;
    rubricScores: RubricScore[];
  }>(response);

  // Ensure score is within bounds
  const suggestedScore = Math.max(0, Math.min(request.maxPoints, parsed.suggestedScore));

  return {
    questionId: request.questionId,
    suggestedScore,
    maxPoints: request.maxPoints,
    confidence: parsed.confidence,
    feedback: parsed.feedback,
    rubricScores: parsed.rubricScores,
    processingTime: Date.now() - startTime,
  };
}

// Batch grade multiple essays
export async function batchGradeEssays(
  request: BatchEssayGradingRequest
): Promise<BatchEssayGradingResult> {
  const startTime = Date.now();

  // Grade essays in parallel (with concurrency limit)
  const CONCURRENCY_LIMIT = 5;
  const results: EssayGradingResult[] = [];

  for (let i = 0; i < request.essays.length; i += CONCURRENCY_LIMIT) {
    const batch = request.essays.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.all(batch.map((essay) => gradeEssay(essay)));
    results.push(...batchResults);
  }

  // Perform consistency check if requested
  if (request.consistencyCheck && results.length > 1) {
    await performConsistencyCheck(results, request.essays);
  }

  // Calculate batch metadata
  const totalScore = results.reduce((sum, r) => sum + r.suggestedScore, 0);
  const averageScore = totalScore / results.length;

  return {
    results,
    batchMetadata: {
      totalEssays: results.length,
      averageScore: Math.round(averageScore * 100) / 100,
      processingTime: Date.now() - startTime,
    },
  };
}

// Check grading consistency across essays
async function performConsistencyCheck(
  results: EssayGradingResult[],
  essays: EssayGradingRequest[]
): Promise<void> {
  // Group by question
  const questionGroups = new Map<string, { result: EssayGradingResult; essay: EssayGradingRequest }[]>();

  results.forEach((result, index) => {
    const essay = essays[index];
    const group = questionGroups.get(result.questionId) || [];
    group.push({ result, essay });
    questionGroups.set(result.questionId, group);
  });

  // Check each group for consistency
  for (const [questionId, group] of Array.from(questionGroups.entries())) {
    if (group.length < 2) continue;

    const scores = group.map((g) => g.result.suggestedScore);
    const maxScore = group[0].essay.maxPoints;

    // Calculate standard deviation
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Flag if standard deviation is too high (> 20% of max score)
    if (stdDev > maxScore * 0.2) {
      console.warn(`Consistency warning for question ${questionId}: stdDev=${stdDev.toFixed(2)}`);
      // In production, this could trigger a re-grading or human review
    }
  }
}

// Generate detailed feedback for an essay
export async function generateDetailedFeedback(
  essay: EssayGradingRequest
): Promise<EssayFeedback> {
  const userPrompt = `Đưa ra phản hồi chi tiết cho bài làm của học sinh:

CÂU HỎI:
${essay.questionContent}

BÀI LÀM:
${essay.studentAnswer}

Yêu cầu output JSON:
{
  "strengths": ["Điểm mạnh chi tiết 1", "Điểm mạnh 2", ...],
  "improvements": ["Cần cải thiện chi tiết 1", "Cần cải thiện 2", ...],
  "overallComment": "Nhận xét tổng quát đầy đủ, khích lệ và xây dựng"
}`;

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.essayGrading,
    userPrompt,
  });

  return parseJSONResponse<EssayFeedback>(response);
}

// Compare two essays for similarity (plagiarism detection)
export async function compareEssays(
  essay1: string,
  essay2: string
): Promise<{
  similarityScore: number;
  analysis: string;
  flags: string[];
}> {
  const userPrompt = `So sánh hai bài làm sau để phát hiện sao chép:

BÀI 1:
${essay1}

BÀI 2:
${essay2}

Yêu cầu output JSON:
{
  "similarityScore": number, // 0.0 đến 1.0
  "analysis": "Phân tích chi tiết về sự tương đồng",
  "flags": ["Cảnh báo 1", ...] // Nếu có dấu hiệu sao chép
}`;

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.essayGrading,
    userPrompt,
  });

  return parseJSONResponse<{
    similarityScore: number;
    analysis: string;
    flags: string[];
  }>(response);
}

// Suggest rubric for a question
export async function suggestRubric(
  questionContent: string,
  maxPoints: number
): Promise<string[]> {
  const userPrompt = `Đề xuất rubric chấm điểm cho câu hỏi tự luận sau:

CÂU HỎI:
${questionContent}

TỔNG ĐIỂM: ${maxPoints}

Yêu cầu output JSON array:
["Tiêu chí 1: x điểm", "Tiêu chí 2: y điểm", ...]

Đảm bảo tổng điểm của các tiêu chí bằng ${maxPoints}.`;

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.essayGrading,
    userPrompt,
  });

  return parseJSONResponse<string[]>(response);
}

// Calibrate grading based on sample essays
export async function calibrateGrading(params: {
  questionContent: string;
  rubric: string[];
  maxPoints: number;
  sampleEssays: Array<{
    answer: string;
    humanScore: number;
  }>;
}): Promise<{
  calibrationFactor: number;
  recommendations: string[];
}> {
  const { questionContent, rubric, maxPoints, sampleEssays } = params;

  // Grade sample essays
  const aiScores = await Promise.all(
    sampleEssays.map((sample) =>
      gradeEssay({
        questionId: 'calibration',
        questionContent,
        studentAnswer: sample.answer,
        rubric,
        maxPoints,
      })
    )
  );

  // Calculate calibration factor
  let totalDiff = 0;
  sampleEssays.forEach((sample, index) => {
    totalDiff += sample.humanScore - aiScores[index].suggestedScore;
  });
  const avgDiff = totalDiff / sampleEssays.length;
  const calibrationFactor = 1 + avgDiff / maxPoints;

  // Generate recommendations
  const recommendations: string[] = [];

  if (Math.abs(avgDiff) > maxPoints * 0.1) {
    if (avgDiff > 0) {
      recommendations.push('AI có xu hướng chấm điểm thấp hơn. Cân nhắc điều chỉnh rubric cho rõ ràng hơn.');
    } else {
      recommendations.push('AI có xu hướng chấm điểm cao hơn. Cân nhắc thêm tiêu chí đánh giá chặt chẽ hơn.');
    }
  }

  return {
    calibrationFactor,
    recommendations,
  };
}
