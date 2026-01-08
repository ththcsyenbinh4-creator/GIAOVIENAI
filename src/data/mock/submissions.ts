import { Submission } from '@/types/domain';

/**
 * Mock Submissions Data
 *
 * Sample student submissions for assignments.
 * In production, this would be fetched from the database.
 */
export let mockSubmissions: Submission[] = [
  // Assignment 1 submissions (Bài kiểm tra Chương 3)
  {
    id: 'sub-1',
    assignmentId: 'assg-1',
    studentId: 'student-1',
    status: 'submitted',
    startedAt: '2024-12-15T14:00:00Z',
    submittedAt: '2024-12-15T14:42:00Z',
    gradedAt: null,
    totalScore: null,
    autoScore: 2.0, // 4/5 MCQs correct
    manualScore: null,
    teacherOverallComment: null,
  },
  {
    id: 'sub-2',
    assignmentId: 'assg-1',
    studentId: 'student-2',
    status: 'submitted',
    startedAt: '2024-12-15T14:00:00Z',
    submittedAt: '2024-12-15T14:38:00Z',
    gradedAt: null,
    totalScore: null,
    autoScore: 2.5, // 5/5 MCQs correct
    manualScore: null,
    teacherOverallComment: null,
  },
  {
    id: 'sub-3',
    assignmentId: 'assg-1',
    studentId: 'student-3',
    status: 'graded',
    startedAt: '2024-12-15T14:00:00Z',
    submittedAt: '2024-12-15T14:35:00Z',
    gradedAt: '2024-12-16T09:00:00Z',
    totalScore: 7.5,
    autoScore: 2.0,
    manualScore: 5.5,
    teacherOverallComment: 'Bài làm tốt, cần cẩn thận hơn trong tính toán.',
  },
  {
    id: 'sub-4',
    assignmentId: 'assg-1',
    studentId: 'student-4',
    status: 'graded',
    startedAt: '2024-12-15T14:00:00Z',
    submittedAt: '2024-12-15T14:40:00Z',
    gradedAt: '2024-12-16T09:30:00Z',
    totalScore: 8.5,
    autoScore: 2.5,
    manualScore: 6.0,
    teacherOverallComment: 'Rất tốt! Trình bày rõ ràng và logic.',
  },

  // Assignment 2 submissions (Bài tập về nhà)
  {
    id: 'sub-5',
    assignmentId: 'assg-2',
    studentId: 'student-1',
    status: 'graded',
    startedAt: '2024-12-16T19:00:00Z',
    submittedAt: '2024-12-16T19:30:00Z',
    gradedAt: '2024-12-17T08:00:00Z',
    totalScore: 5,
    autoScore: 5,
    manualScore: null,
    teacherOverallComment: 'Hoàn thành tốt!',
  },
  {
    id: 'sub-6',
    assignmentId: 'assg-2',
    studentId: 'student-5',
    status: 'submitted',
    startedAt: '2024-12-17T20:00:00Z',
    submittedAt: '2024-12-17T20:25:00Z',
    gradedAt: null,
    totalScore: null,
    autoScore: 4,
    manualScore: null,
    teacherOverallComment: null,
  },

  // Assignment 3 submissions (Kiểm tra nhanh - class-8b)
  {
    id: 'sub-7',
    assignmentId: 'assg-3',
    studentId: 'student-6',
    status: 'submitted',
    startedAt: '2024-12-17T09:00:00Z',
    submittedAt: '2024-12-17T09:14:00Z',
    gradedAt: null,
    totalScore: null,
    autoScore: 3,
    manualScore: null,
    teacherOverallComment: null,
  },
  {
    id: 'sub-8',
    assignmentId: 'assg-3',
    studentId: 'student-7',
    status: 'submitted',
    startedAt: '2024-12-17T09:00:00Z',
    submittedAt: '2024-12-17T09:12:00Z',
    gradedAt: null,
    totalScore: null,
    autoScore: 2,
    manualScore: null,
    teacherOverallComment: null,
  },
  {
    id: 'sub-9',
    assignmentId: 'assg-3',
    studentId: 'student-8',
    status: 'graded',
    startedAt: '2024-12-17T09:00:00Z',
    submittedAt: '2024-12-17T09:10:00Z',
    gradedAt: '2024-12-17T14:00:00Z',
    totalScore: 4.5,
    autoScore: 3,
    manualScore: 1.5,
    teacherOverallComment: 'Cần ôn lại cách vẽ đồ thị.',
  },

  // In-progress submissions
  {
    id: 'sub-10',
    assignmentId: 'assg-1',
    studentId: 'student-5',
    status: 'in_progress',
    startedAt: '2024-12-18T10:00:00Z',
    submittedAt: null,
    gradedAt: null,
    totalScore: null,
    autoScore: null,
    manualScore: null,
    teacherOverallComment: null,
  },
];

// Counter for generating new IDs
let submissionIdCounter = 11;

// Helper to generate new submission ID
export function generateSubmissionId(): string {
  return `sub-${submissionIdCounter++}`;
}

// Helper to get submission by ID
export function getSubmissionById(id: string): Submission | undefined {
  return mockSubmissions.find((s) => s.id === id);
}

// Helper to get submissions by assignment ID
export function getSubmissionsByAssignmentId(assignmentId: string): Submission[] {
  return mockSubmissions.filter((s) => s.assignmentId === assignmentId);
}

// Helper to get submissions by student ID
export function getSubmissionsByStudentId(studentId: string): Submission[] {
  return mockSubmissions.filter((s) => s.studentId === studentId);
}

// Helper to find submission by student and assignment
export function findSubmission(studentId: string, assignmentId: string): Submission | undefined {
  return mockSubmissions.find(
    (s) => s.studentId === studentId && s.assignmentId === assignmentId
  );
}

// Helper to update submission
export function updateSubmissionInStore(
  id: string,
  updates: Partial<Submission>
): Submission | null {
  const index = mockSubmissions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  mockSubmissions[index] = { ...mockSubmissions[index], ...updates };
  return mockSubmissions[index];
}

// Helper to add submission
export function addSubmission(submission: Submission): void {
  mockSubmissions.push(submission);
}
