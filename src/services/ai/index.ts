// AI Service - Main Export File
// Classroom AI - Smart Educational Platform

// Types
export * from './types';

// Configuration
export { getAIConfig, validateConfig, rateLimitConfig, modelConfigs } from './config';

// Core Client
export { createCompletion, parseJSONResponse, createAIError } from './client';

// Document Analysis
export {
  analyzeDocument,
  getQuickSummary,
  extractQuestionsFromDocument,
} from './document-analysis';

// Question Generation
export {
  generateQuestions,
  generateSingleQuestion,
  generateBalancedQuestions,
  improveQuestion,
  generateSimilarQuestions,
  validateQuestion,
} from './question-generation';

// Essay Grading
export {
  gradeEssay,
  batchGradeEssays,
  generateDetailedFeedback,
  compareEssays,
  suggestRubric,
  calibrateGrading,
} from './essay-grading';

// Prompts (for advanced usage)
export { SYSTEM_PROMPTS } from './prompts';

// ============================================================
// Quick Usage Examples
// ============================================================

/*
// 1. Analyze a document
import { analyzeDocument } from '@/services/ai';

const result = await analyzeDocument({
  documentId: 'doc-123',
  documentUrl: 'https://storage.example.com/doc.pdf',
  documentType: 'pdf',
  options: {
    questionCount: 10,
  },
});

console.log(result.summary);
console.log(result.suggestedQuestions);


// 2. Generate questions
import { generateQuestions } from '@/services/ai';

const result = await generateQuestions({
  topic: 'Hàm số bậc nhất',
  gradeLevel: 'Lớp 8',
  subject: 'Toán học',
  questionCount: 5,
  questionTypes: ['single', 'essay'],
  difficulty: 'medium',
});

console.log(result.questions);


// 3. Grade an essay
import { gradeEssay } from '@/services/ai';

const result = await gradeEssay({
  questionId: 'q-123',
  questionContent: 'Vẽ đồ thị hàm số y = 2x - 4...',
  studentAnswer: 'Để vẽ đồ thị hàm số...',
  rubric: ['Vẽ đúng đồ thị: 1 điểm', ...],
  maxPoints: 3,
});

console.log(result.suggestedScore);
console.log(result.feedback);


// 4. Batch grade essays
import { batchGradeEssays } from '@/services/ai';

const result = await batchGradeEssays({
  essays: [...],
  consistencyCheck: true,
});

console.log(result.batchMetadata.averageScore);


// 5. With streaming
import { generateQuestions } from '@/services/ai';

const result = await generateQuestions(request, {
  onToken: (token) => console.log(token),
  onComplete: (full) => console.log('Done:', full),
});
*/
