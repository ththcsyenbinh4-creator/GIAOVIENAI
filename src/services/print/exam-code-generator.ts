/**
 * Exam Code Generator Service
 *
 * Generates shuffled exam variants (A, B, C, D) with deterministic shuffling
 * to ensure reproducibility and fairness.
 */

import { Question, ExamCodeLetter, ExamCodeData } from '@/types/domain';
import { seededShuffle } from '@/lib/utils';

/**
 * Generate exam code variants by shuffling questions and answers
 * Uses deterministic shuffling with assignmentId + code as seed
 */
export function generateExamCodes(
  assignmentId: string,
  questions: Question[],
  codes: ExamCodeLetter[] = ['A', 'B', 'C', 'D']
): ExamCodeData[] {
  return codes.map((code) => {
    const seed = `${assignmentId}-${code}`;

    // Shuffle question order
    const shuffledQuestions = seededShuffle(questions, seed);
    const questionOrder = shuffledQuestions.map((q) => q.id);

    // Shuffle answers for MCQ questions and build answer key
    const answerMappings: Record<string, number[]> = {};
    const answerKey: Record<string, number> = {};

    shuffledQuestions.forEach((question, qIndex) => {
      if (question.type === 'mcq' && question.choices && question.choices.length > 0) {
        // Create answer seed specific to this question
        const answerSeed = `${seed}-q${qIndex}`;

        // Create indices array [0, 1, 2, 3]
        const originalIndices = question.choices.map((_, i) => i);
        const shuffledIndices = seededShuffle(originalIndices, answerSeed);

        answerMappings[question.id] = shuffledIndices;

        // Find where the correct answer ended up
        const originalCorrectIndex = question.correctAnswerIndex ?? 0;
        const newCorrectIndex = shuffledIndices.indexOf(originalCorrectIndex);
        answerKey[question.id] = newCorrectIndex;
      } else if (question.type === 'essay') {
        // Essay questions don't need answer mapping
        answerKey[question.id] = -1; // Indicates essay/manual grading
      }
    });

    return {
      code,
      questionOrder,
      answerMappings,
      answerKey,
    };
  });
}

/**
 * Get shuffled choices for a question based on exam code's answer mapping
 */
export function getShuffledChoices(
  question: Question,
  answerMapping: number[]
): string[] {
  if (!question.choices) return [];
  return answerMapping.map((originalIndex) => question.choices![originalIndex]);
}

/**
 * Convert student's answer from shuffled index to original index
 * Used when grading paper-based exams
 */
export function convertAnswerToOriginal(
  shuffledIndex: number,
  answerMapping: number[]
): number {
  return answerMapping[shuffledIndex];
}

/**
 * Get the correct answer letter for display (A, B, C, D)
 */
export function getCorrectAnswerLetter(
  questionId: string,
  answerKey: Record<string, number>
): string {
  const index = answerKey[questionId];
  if (index === -1) return 'Tự luận';
  return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
}

/**
 * Generate answer key summary for a single exam code
 */
export function generateAnswerKeySummary(
  examCode: ExamCodeData,
  questions: Question[]
): Array<{ questionNumber: number; answer: string; points: number }> {
  return examCode.questionOrder.map((qId, index) => {
    const question = questions.find((q) => q.id === qId);
    if (!question) {
      return { questionNumber: index + 1, answer: '?', points: 0 };
    }

    return {
      questionNumber: index + 1,
      answer: getCorrectAnswerLetter(qId, examCode.answerKey),
      points: question.maxScore,
    };
  });
}
