/**
 * Domain Models for Giáo Viên AI Platform
 *
 * These types define the core data structures used throughout the application.
 * When migrating to a real database (e.g., Supabase/Postgres), these types
 * should map directly to your database schema.
 */

// ============================================================
// Core Entities
// ============================================================

export interface Class {
  id: string;
  name: string;                    // e.g., "Lớp 8A"
  grade: number | null;            // e.g., 8, 9, 10
  studentCount: number;
  createdAt: string;               // ISO datetime
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  classId: string;
  avatarUrl?: string | null;
  createdAt: string;
}

// ============================================================
// Assignment & Questions
// ============================================================

export type AssignmentType = 'homework' | 'quiz' | 'test';
export type AssignmentStatus = 'draft' | 'published';

export interface AssignmentSettings {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAfterSubmit: boolean;
  maxAttempts: number | null;      // null = unlimited
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  classId: string;
  type: AssignmentType;
  status: AssignmentStatus;
  durationMinutes: number | null;  // null = no time limit
  dueAt: string | null;            // ISO datetime
  createdAt: string;
  updatedAt: string;
  settings: AssignmentSettings;
}

export type QuestionType = 'mcq' | 'essay';
export type QuestionSource = 'manual' | 'ai';

export interface Question {
  id: string;
  assignmentId: string;
  order: number;
  type: QuestionType;
  prompt: string;
  choices?: string[];              // For MCQ only
  correctAnswerIndex?: number | null; // For MCQ only
  maxScore: number;
  source: QuestionSource;
}

// ============================================================
// Submissions & Grading
// ============================================================

export type SubmissionStatus = 'in_progress' | 'submitted' | 'graded';

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  totalScore: number | null;
  autoScore: number | null;        // Score from auto-graded MCQs
  manualScore: number | null;      // Score from manually graded essays
  teacherOverallComment?: string | null;
}

export interface AISuggestion {
  suggestedScore: number;
  strengths: string[];
  improvements: string[];
  comment: string;
  source?: 'openai' | 'heuristic' | 'heuristic-fallback';
}

export interface SubmissionAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answerText?: string;             // For essay
  selectedChoiceIndex?: number | null; // For MCQ
  isCorrect?: boolean | null;      // For MCQ
  score: number | null;
  aiSuggestion?: AISuggestion | null;
  teacherComment?: string | null;
}

// ============================================================
// API Request/Response Types
// ============================================================

// Assignment List Response (with stats)
export interface AssignmentWithStats extends Assignment {
  className: string;
  submittedCount: number;
  totalStudents: number;
  gradedCount: number;
  questionCount: number;
}

// Assignment Detail Response
export interface AssignmentDetail extends Assignment {
  className: string;
  questions: Question[];
}

// Create Assignment Request
export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  classId: string;
  type: AssignmentType;
  status: AssignmentStatus;
  durationMinutes: number | null;
  dueAt: string | null;
  settings: AssignmentSettings;
  questions: Omit<Question, 'id' | 'assignmentId'>[];
}

// Update Assignment Request
export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  type?: AssignmentType;
  status?: AssignmentStatus;
  durationMinutes?: number | null;
  dueAt?: string | null;
  settings?: Partial<AssignmentSettings>;
}

// Submission List Response
export interface SubmissionListItem {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string | null;
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: AssignmentType;
  className: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  totalScore: number | null;
  maxScore: number;
  hasEssay: boolean;
  essayCount: number;
  mcqScore: number | null;
  mcqMaxScore: number;
}

// Submission Detail Response
export interface SubmissionDetail extends Submission {
  student: Student;
  assignment: Pick<Assignment, 'id' | 'title' | 'type' | 'durationMinutes'>;
  className: string;
  answers: SubmissionAnswerDetail[];
  maxScore: number;
}

export interface SubmissionAnswerDetail extends SubmissionAnswer {
  question: Question;
}

// Grade Submission Request
export interface GradeSubmissionPayload {
  answers: Array<{
    questionId: string;
    score: number;
    teacherComment?: string;
  }>;
  overallComment?: string;
}

// ============================================================
// AI Mock Types
// ============================================================

export interface GenerateQuestionsRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
  questionType?: 'mcq' | 'essay' | 'mixed';
}

export interface GeneratedQuestion {
  type: QuestionType;
  prompt: string;
  choices?: string[];
  correctAnswerIndex?: number | null;
  maxScore: number;
  source: 'ai';
}

export interface GradeEssayRequest {
  answerText: string;
  questionPrompt?: string;
  maxScore: number;
}

export interface GradeEssayResponse {
  suggestedScore: number;
  strengths: string[];
  improvements: string[];
  comment: string;
  source?: 'openai' | 'heuristic' | 'heuristic-fallback';
}

// ============================================================
// Student Flow Types
// ============================================================

export interface StudentAnswerUpdate {
  questionId: string;
  selectedChoiceIndex?: number | null;
  answerText?: string | null;
}

export interface StartSubmissionPayload {
  assignmentId: string;
  studentId: string;
}

export interface UpdateSubmissionAnswersPayload {
  answers: StudentAnswerUpdate[];
}

// ============================================================
// Filter Types
// ============================================================

export interface AssignmentFilters {
  status?: AssignmentStatus;
  classId?: string;
  search?: string;
  type?: AssignmentType;
}

export interface SubmissionFilters {
  status?: SubmissionStatus;
  assignmentId?: string;
  classId?: string;
  hasEssayOnly?: boolean;
}

// ============================================================
// Print & Exam Code Types
// ============================================================

export type ExamCodeLetter = 'A' | 'B' | 'C' | 'D';

export interface ExamCode {
  id: string;
  assignmentId: string;
  code: ExamCodeLetter;
  questionOrder: string[];  // Question IDs in shuffled order
  answerMappings: Record<string, number[]>;  // questionId -> shuffled answer indices
  answerKey: Record<string, number>;  // questionId -> correct answer index after shuffle
  createdAt: string;
}

export interface ExamCodeData {
  code: ExamCodeLetter;
  questionOrder: string[];
  answerMappings: Record<string, number[]>;
  answerKey: Record<string, number>;
}

export interface PrintExamRequest {
  assignmentId: string;
  codes: ExamCodeLetter[];
  copiesPerCode: number;
  includeAnswerKey: boolean;
  options?: {
    paperSize?: 'A4' | 'Letter';
    fontSize?: 'small' | 'medium' | 'large';
    headerText?: string;
    schoolName?: string;
    showStudentInfo?: boolean;
  };
}

export interface PrintJob {
  id: string;
  assignmentId: string;
  jobType: 'exam' | 'answer_key' | 'results';
  codes: ExamCodeLetter[];
  copiesPerCode: number;
  includeAnswerKey: boolean;
  pdfUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
}

export interface PrintResultsRequest {
  assignmentId: string;
  studentIds?: string[];
  includeAnswers: boolean;
  includeFeedback: boolean;
  format: 'individual' | 'summary';
}

// ============================================================
// Document AI Types
// ============================================================

export type DocumentType = 'pdf' | 'docx' | 'pptx' | 'image';
export type DocumentProcessingStatus = 'pending' | 'extracting' | 'analyzing' | 'completed' | 'failed';

export interface DocumentSection {
  id: string;
  title?: string;
  content: string;
  pageNumber?: number;
  slideNumber?: number;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'formula';
  metadata?: {
    level?: number;  // For headings: h1=1, h2=2, etc.
    listType?: 'ordered' | 'unordered';
    imageUrl?: string;
    tableData?: string[][];
  };
}

export interface ExtractedDocument {
  id: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number;
  totalPages?: number;
  totalSlides?: number;
  sections: DocumentSection[];
  rawText: string;
  extractedAt: string;
}

export interface AIDocumentAnalysis {
  id: string;
  documentId: string;
  summary: string;
  keyConcepts: string[];
  mainTopics: Array<{
    topic: string;
    description: string;
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  }>;
  formulas?: string[];
  examples?: string[];
  analyzedAt: string;
}

export interface AIGeneratedContent {
  id: string;
  documentId: string;
  analysisId: string;
  contentType: 'questions' | 'summary' | 'lesson_plan' | 'study_guide' | 'quiz';
  questions?: GeneratedQuestion[];
  summaryText?: string;
  lessonOutline?: Array<{
    section: string;
    duration: string;
    activities: string[];
    objectives: string[];
  }>;
  studyGuide?: Array<{
    topic: string;
    keyPoints: string[];
    practiceQuestions: string[];
  }>;
  createdAt: string;
}

export type AIGenerationMode =
  | 'create_assignment'      // Tạo bài tập cho tiết học
  | 'create_test'            // Tạo đề kiểm tra
  | 'create_study_material'  // Tạo tài liệu ôn tập
  | 'create_lesson'          // Tạo bài giảng tóm tắt
  | 'create_question_bank'   // Tạo ngân hàng câu hỏi
  | 'create_audio_lecture';  // Tạo bài giảng audio (Phase 3)

export interface DocumentUploadRequest {
  file: File;
  mode: AIGenerationMode;
  options?: {
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    questionTypes?: ('mcq' | 'essay' | 'fill_blank' | 'matching')[];
    targetGrade?: number;
    subject?: string;
    duration?: number;  // For test: time in minutes
  };
}

export interface DocumentProcessingJob {
  id: string;
  fileName: string;
  fileType: DocumentType;
  mode: AIGenerationMode;
  status: DocumentProcessingStatus;
  progress: number;  // 0-100
  progressMessage: string;
  extractedDocument?: ExtractedDocument;
  analysis?: AIDocumentAnalysis;
  generatedContent?: AIGeneratedContent;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================
// Voice / TTS Types
// ============================================================

export type VoiceMode =
  | 'lesson-summary'      // Tóm tắt bài học
  | 'study-guide'         // Hướng dẫn ôn tập
  | 'answer-explanation'; // Giải thích đáp án

export type VoiceLanguage = 'vi' | 'en';

export type VoiceProfile =
  | 'teacher-default'     // Giọng giáo viên mặc định
  | 'teacher-female'      // Giọng nữ
  | 'teacher-male';       // Giọng nam

export interface VoiceGenerateRequest {
  mode: VoiceMode;
  text: string;
  language?: VoiceLanguage;
  voiceProfile?: VoiceProfile;
  speed?: number; // 0.25 - 4.0, default 1.0
}

export interface VoiceGenerateResponse {
  audioUrl: string;           // URL or base64 data URL
  durationSeconds?: number;
  mode: VoiceMode;
  createdAt: string;
}

export interface AudioExplanation {
  id: string;
  questionId?: string;
  assignmentId?: string;
  audioUrl: string;
  text: string;
  mode: VoiceMode;
  createdAt: string;
}

// ============================================================
// Slide Engine Types
// ============================================================

export type SlideBlockType =
  | 'title'
  | 'subtitle'
  | 'paragraph'
  | 'bullet-list'
  | 'numbered-list'
  | 'quote'
  | 'exercise'
  | 'image-suggestion'
  | 'key-point';

export type SlideBlock =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'exercise'; prompt: string; hint?: string }
  | { type: 'image-suggestion'; prompt: string }
  | { type: 'key-point'; text: string; icon?: string };

export interface Slide {
  id: string;
  title?: string;
  blocks: SlideBlock[];
  notesForTeacher?: string;
  layout?: 'default' | 'title-only' | 'two-column' | 'centered';
}

export interface SlideDeck {
  id: string;
  lessonTitle: string;
  gradeLevel?: string;
  subject?: string;
  slides: Slide[];
  createdAt: string;
}

export type SlideGenerateMode = 'from-lesson-plan' | 'from-document' | 'from-study-guide';

export interface SlideGenerateRequest {
  mode: SlideGenerateMode;
  lessonTitle: string;
  gradeLevel?: string;
  subject?: string;
  content: string;
  targetSlideCount?: number;
}

export interface SlideGenerateResponse {
  deck: SlideDeck;
}

// ============================================================
// Flashcard Types
// ============================================================

export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  front: string;           // Question/term side
  back: string;            // Answer/definition side
  hint?: string;           // Optional hint
  category?: string;       // Topic category
  difficulty: FlashcardDifficulty;
  imageUrl?: string;       // Optional image
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  cards: Flashcard[];
  createdAt: string;
}

export type FlashcardGenerateMode = 'from-lesson-plan' | 'from-document' | 'from-study-guide';

export interface FlashcardGenerateRequest {
  mode: FlashcardGenerateMode;
  title: string;
  gradeLevel?: string;
  subject?: string;
  content: string;
  targetCardCount?: number;
  difficulty?: FlashcardDifficulty | 'mixed';
}

export interface FlashcardGenerateResponse {
  deck: FlashcardDeck;
}

// Student flashcard progress tracking
export interface FlashcardProgress {
  cardId: string;
  deckId: string;
  studentId: string;
  timesReviewed: number;
  timesCorrect: number;
  lastReviewedAt: string;
  nextReviewAt: string;      // Spaced repetition
  easeFactor: number;        // SM-2 algorithm factor
  interval: number;          // Days until next review
}

export type FlashcardReviewResult = 'again' | 'hard' | 'good' | 'easy';

// ============================================================
// Worksheet Types
// ============================================================

export type WorksheetQuestionType =
  | 'fill-blank'      // Điền vào chỗ trống
  | 'matching'        // Nối cột
  | 'true-false'      // Đúng/Sai
  | 'short-answer'    // Trả lời ngắn
  | 'ordering'        // Sắp xếp thứ tự
  | 'mcq';            // Trắc nghiệm

export interface WorksheetQuestion {
  id: string;
  type: WorksheetQuestionType;
  order: number;
  points: number;
  question: string;

  // For fill-blank: text with ___blanks___
  blanks?: string[];

  // For matching: pairs to match
  matchingPairs?: Array<{ left: string; right: string }>;

  // For true-false
  isTrue?: boolean;

  // For short-answer: expected answer
  expectedAnswer?: string;

  // For ordering: correct order
  orderItems?: string[];

  // For MCQ
  choices?: string[];
  correctAnswerIndex?: number;

  // Common
  explanation?: string;
}

export interface Worksheet {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  instructions?: string;
  totalPoints: number;
  estimatedMinutes?: number;
  questions: WorksheetQuestion[];
  createdAt: string;
}

export type WorksheetGenerateMode = 'from-lesson-plan' | 'from-document' | 'from-study-guide';

export interface WorksheetGenerateRequest {
  mode: WorksheetGenerateMode;
  title: string;
  gradeLevel?: string;
  subject?: string;
  content: string;
  targetQuestionCount?: number;
  questionTypes?: WorksheetQuestionType[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface WorksheetGenerateResponse {
  worksheet: Worksheet;
}

// ============================================================
// Lesson Flow Types (45-minute Teaching Pack)
// ============================================================

export type LessonStatus = 'draft' | 'ready' | 'in_progress' | 'completed';

export type LessonStepType =
  | 'intro'           // Giới thiệu bài học
  | 'slide'           // Trình chiếu slide
  | 'audio'           // Audio giảng giải
  | 'flashcard'       // Ôn tập flashcard
  | 'worksheet'       // Bài tập worksheet
  | 'discussion'      // Thảo luận
  | 'break'           // Nghỉ giải lao
  | 'summary'         // Tổng kết
  | 'homework';       // Giao bài về nhà

export interface LessonStep {
  id: string;
  type: LessonStepType;
  title: string;
  durationMinutes: number;
  order: number;
  isCompleted: boolean;
  completedAt?: string;

  // Content references (one per step type)
  slideId?: string;           // Reference to slide in deck
  slideDeck?: SlideDeck;      // Inline slide deck for this step
  audioUrl?: string;          // Audio file URL
  audioText?: string;         // Text that was converted to audio
  flashcardDeck?: FlashcardDeck;
  worksheet?: Worksheet;

  // For intro/discussion/summary/homework
  description?: string;
  notes?: string;
  instructions?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  classId?: string;           // Optional: assign to specific class

  // Timing
  totalDurationMinutes: number;
  estimatedEndTime?: string;

  // Content
  steps: LessonStep[];
  objectives?: string[];      // Learning objectives
  prerequisites?: string[];   // What students should know
  materials?: string[];       // Required materials

  // Status tracking
  status: LessonStatus;
  currentStepIndex: number;
  startedAt?: string;
  completedAt?: string;

  // Teaching notes
  teacherNotes?: string;

  // Source document (if generated from Document AI)
  sourceDocumentId?: string;
  sourceAnalysisId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface LessonWithProgress extends Lesson {
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  className?: string;
}

// Lesson Generation
export type LessonGenerateMode = 'from-document' | 'from-scratch' | 'from-template';

export interface LessonGenerateRequest {
  mode: LessonGenerateMode;
  title: string;
  subject?: string;
  gradeLevel?: string;
  targetDuration?: number;    // Target total minutes (default: 45)
  content?: string;           // Source content for generation

  // What to include
  includeSlides?: boolean;
  includeAudio?: boolean;
  includeFlashcards?: boolean;
  includeWorksheet?: boolean;
  includeHomework?: boolean;

  // Additional options
  objectives?: string[];
  customSteps?: Array<{
    type: LessonStepType;
    title?: string;
    duration?: number;
  }>;
}

export interface LessonGenerateResponse {
  lesson: Lesson;
}

// Lesson Template (predefined structures)
export interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  totalDuration: number;
  steps: Array<{
    type: LessonStepType;
    title: string;
    duration: number;
    description?: string;
  }>;
  suitableFor: string[];      // e.g., ['Toán', 'Ngữ văn', 'Tiếng Anh']
}

// Live Teaching Session
export type LiveSessionStatus = 'waiting' | 'active' | 'paused' | 'ended';

export interface LiveTeachingSession {
  id: string;
  lessonId: string;
  teacherId: string;
  classId?: string;

  status: LiveSessionStatus;
  currentStepIndex: number;
  currentSlideIndex?: number;

  // Timing
  startedAt?: string;
  pausedAt?: string;
  endedAt?: string;
  totalPausedSeconds: number;

  // Student engagement (future feature)
  activeStudentCount?: number;
  joinCode?: string;          // Code for students to join

  createdAt: string;
}

// Student Lesson Progress
export interface StudentLessonProgress {
  id: string;
  lessonId: string;
  studentId: string;
  sessionId?: string;         // Live session they attended

  // Progress
  completedSteps: string[];   // Step IDs
  currentStepId?: string;

  // Engagement data
  flashcardResults?: {
    totalCards: number;
    cardsReviewed: number;
    correctCount: number;
  };
  worksheetResults?: {
    submissionId?: string;
    score?: number;
    totalPoints: number;
  };

  // Timing
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string;
  totalTimeMinutes: number;
}
