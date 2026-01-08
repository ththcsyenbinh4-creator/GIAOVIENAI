// AI Service Types

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

// Document Analysis
export interface DocumentAnalysisRequest {
  documentId: string;
  documentUrl: string;
  documentType: 'pdf' | 'docx' | 'pptx' | 'txt';
  options?: {
    extractKeyPoints?: boolean;
    generateSummary?: boolean;
    suggestQuestions?: boolean;
    questionCount?: number;
  };
}

export interface DocumentAnalysisResult {
  documentId: string;
  summary: string;
  objectives: string[];
  keyPoints: string[];
  suggestedQuestions: SuggestedQuestion[];
  processingTime: number;
}

export interface SuggestedQuestion {
  id: string;
  type: 'single' | 'multiple' | 'essay';
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  options?: QuestionOption[];
  correctAnswer?: string;
  rubric?: string[];
  sourceSection?: string;
}

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

// Question Generation
export interface QuestionGenerationRequest {
  topic: string;
  gradeLevel: string;
  subject: string;
  questionCount: number;
  questionTypes: ('single' | 'multiple' | 'essay')[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  context?: string;
  existingQuestions?: string[];
}

export interface QuestionGenerationResult {
  questions: GeneratedQuestion[];
  metadata: {
    topic: string;
    gradeLevel: string;
    generatedAt: string;
    processingTime: number;
  };
}

export interface GeneratedQuestion {
  id: string;
  type: 'single' | 'multiple' | 'essay';
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  options?: QuestionOption[];
  correctAnswerExplanation?: string;
  rubric?: string[];
  bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

// Essay Grading
export interface EssayGradingRequest {
  questionId: string;
  questionContent: string;
  studentAnswer: string;
  rubric: string[];
  maxPoints: number;
  gradeLevel?: string;
  subject?: string;
}

export interface EssayGradingResult {
  questionId: string;
  suggestedScore: number;
  maxPoints: number;
  confidence: number;
  feedback: EssayFeedback;
  rubricScores: RubricScore[];
  processingTime: number;
}

export interface EssayFeedback {
  strengths: string[];
  improvements: string[];
  overallComment: string;
}

export interface RubricScore {
  criterion: string;
  score: number;
  maxScore: number;
  comment: string;
}

// Batch Essay Grading
export interface BatchEssayGradingRequest {
  essays: EssayGradingRequest[];
  consistencyCheck?: boolean;
}

export interface BatchEssayGradingResult {
  results: EssayGradingResult[];
  batchMetadata: {
    totalEssays: number;
    averageScore: number;
    processingTime: number;
  };
}

// Content Moderation
export interface ContentModerationRequest {
  content: string;
  contentType: 'question' | 'answer' | 'document';
}

export interface ContentModerationResult {
  isAppropriate: boolean;
  flags: ContentFlag[];
  suggestions?: string[];
}

export interface ContentFlag {
  type: 'inappropriate' | 'plagiarism' | 'off-topic' | 'low-quality';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Error Types
export interface AIServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// Streaming Types
export interface StreamingOptions {
  onToken?: (token: string) => void;
  onComplete?: (result: string) => void;
  onError?: (error: AIServiceError) => void;
}
