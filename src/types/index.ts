// Re-export database types
export * from './database';

// Application-specific types

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonPlan {
  objectives: string[];
  outline: LessonSection[];
  keyPoints: string[];
  suggestedActivities: string[];
}

export interface LessonSection {
  title: string;
  content: string;
  duration?: number;
}

export interface ActivityLog {
  timestamp: Date;
  action: 'start' | 'answer' | 'blur' | 'focus' | 'submit';
  data?: Record<string, unknown>;
}

export interface AIGeneratedQuestion {
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'essay';
  content: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface AIEssayGrading {
  suggestedScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface AIAnalysisResult {
  summary: string;
  weakAreas: string[];
  recommendations: string[];
}

// API Request/Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form types
export interface CreateClassForm {
  name: string;
  description?: string;
}

export interface CreateAssignmentForm {
  classId: string;
  title: string;
  description?: string;
  type: 'homework' | 'quiz' | 'exam';
  durationMinutes?: number;
  deadline?: string;
  isRandomizeQuestions?: boolean;
  isRandomizeOptions?: boolean;
  showAnswersAfterSubmit?: boolean;
  maxAttempts?: number;
}

export interface CreateQuestionForm {
  assignmentId?: string;
  documentId?: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'essay';
  content: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface SubmitAnswerForm {
  questionId: string;
  answerText?: string;
  selectedOptionIds?: string[];
}

export interface GradeSubmissionForm {
  answers: {
    answerId: string;
    score: number;
    feedback?: string;
  }[];
  overallFeedback?: string;
}

// UI State types
export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}
