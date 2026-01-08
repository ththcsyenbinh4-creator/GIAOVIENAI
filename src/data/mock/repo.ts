/**
 * Mock Repository Layer
 *
 * This module provides a clean abstraction over the mock data.
 * When migrating to a real database, replace these functions with
 * actual database queries (e.g., Supabase, Prisma).
 */

import {
  Assignment,
  AssignmentWithStats,
  AssignmentDetail,
  AssignmentFilters,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  Question,
  Submission,
  SubmissionAnswer,
  SubmissionListItem,
  SubmissionDetail,
  SubmissionFilters,
  SubmissionAnswerDetail,
  GradeSubmissionPayload,
  Student,
  Class,
} from '@/types/domain';

import { mockClasses, getClassById, getClassName } from './classes';
import { mockStudents, getStudentById, getStudentsByClassId } from './students';
import {
  mockAssignments,
  getAssignmentById,
  generateAssignmentId,
  addAssignment,
  updateAssignmentInStore,
  deleteAssignmentFromStore,
} from './assignments';
import {
  mockQuestions,
  getQuestionsByAssignmentId,
  generateQuestionId,
  addQuestions,
  deleteQuestionsByAssignmentId,
  getMaxScoreByAssignmentId,
} from './questions';
import {
  mockSubmissions,
  getSubmissionById,
  getSubmissionsByAssignmentId,
  getSubmissionsByStudentId,
  findSubmission,
  updateSubmissionInStore,
  addSubmission,
  generateSubmissionId,
} from './submissions';
import {
  mockSubmissionAnswers,
  getAnswersBySubmissionId,
  updateAnswersInStore,
  addAnswers,
  generateAnswerId,
  updateStudentAnswers,
} from './submissionAnswers';

// ============================================================
// Class Repository
// ============================================================

export function getClasses(): Class[] {
  return mockClasses;
}

export function getClassDetail(id: string): Class | null {
  return getClassById(id) || null;
}

// ============================================================
// Assignment Repository
// ============================================================

export function getAssignments(filters: AssignmentFilters = {}): AssignmentWithStats[] {
  let assignments = [...mockAssignments];

  // Apply filters
  if (filters.status) {
    assignments = assignments.filter((a) => a.status === filters.status);
  }

  if (filters.classId) {
    assignments = assignments.filter((a) => a.classId === filters.classId);
  }

  if (filters.type) {
    assignments = assignments.filter((a) => a.type === filters.type);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    assignments = assignments.filter((a) => a.title.toLowerCase().includes(searchLower));
  }

  // Add stats to each assignment
  return assignments.map((assignment) => {
    const classInfo = getClassById(assignment.classId);
    const submissions = getSubmissionsByAssignmentId(assignment.id);
    const questions = getQuestionsByAssignmentId(assignment.id);

    return {
      ...assignment,
      className: classInfo?.name || 'Unknown',
      submittedCount: submissions.filter((s) => s.status !== 'in_progress').length,
      totalStudents: classInfo?.studentCount || 0,
      gradedCount: submissions.filter((s) => s.status === 'graded').length,
      questionCount: questions.length,
    };
  });
}

export function getAssignmentDetail(id: string): AssignmentDetail | null {
  const assignment = getAssignmentById(id);
  if (!assignment) return null;

  const classInfo = getClassById(assignment.classId);
  const questions = getQuestionsByAssignmentId(id);

  return {
    ...assignment,
    className: classInfo?.name || 'Unknown',
    questions,
  };
}

export function createAssignment(payload: CreateAssignmentPayload): AssignmentDetail {
  const now = new Date().toISOString();
  const assignmentId = generateAssignmentId();

  // Create the assignment
  const assignment: Assignment = {
    id: assignmentId,
    title: payload.title,
    description: payload.description,
    classId: payload.classId,
    type: payload.type,
    status: payload.status,
    durationMinutes: payload.durationMinutes,
    dueAt: payload.dueAt,
    createdAt: now,
    updatedAt: now,
    settings: payload.settings,
  };

  addAssignment(assignment);

  // Create questions
  const questions: Question[] = payload.questions.map((q, index) => ({
    id: generateQuestionId(),
    assignmentId,
    order: index + 1,
    type: q.type,
    prompt: q.prompt,
    choices: q.choices,
    correctAnswerIndex: q.correctAnswerIndex,
    maxScore: q.maxScore,
    source: q.source,
  }));

  addQuestions(questions);

  const classInfo = getClassById(assignment.classId);

  return {
    ...assignment,
    className: classInfo?.name || 'Unknown',
    questions,
  };
}

export function updateAssignment(
  id: string,
  payload: UpdateAssignmentPayload
): AssignmentDetail | null {
  const existing = getAssignmentById(id);
  if (!existing) return null;

  // Build updates without settings first
  const { settings: payloadSettings, ...restPayload } = payload;
  const updates: Partial<Assignment> = {
    ...restPayload,
    updatedAt: new Date().toISOString(),
  };

  if (payloadSettings) {
    updates.settings = { ...existing.settings, ...payloadSettings };
  }

  const updated = updateAssignmentInStore(id, updates);
  if (!updated) return null;

  const classInfo = getClassById(updated.classId);
  const questions = getQuestionsByAssignmentId(id);

  return {
    ...updated,
    className: classInfo?.name || 'Unknown',
    questions,
  };
}

export function deleteAssignment(id: string): boolean {
  // Delete questions first
  deleteQuestionsByAssignmentId(id);
  // Then delete assignment
  return deleteAssignmentFromStore(id);
}

// ============================================================
// Submission Repository
// ============================================================

export function getSubmissions(filters: SubmissionFilters = {}): SubmissionListItem[] {
  let submissions = [...mockSubmissions];

  // Apply filters
  if (filters.status) {
    submissions = submissions.filter((s) => s.status === filters.status);
  }

  if (filters.assignmentId) {
    submissions = submissions.filter((s) => s.assignmentId === filters.assignmentId);
  }

  if (filters.classId) {
    const studentIds = getStudentsByClassId(filters.classId).map((s) => s.id);
    submissions = submissions.filter((s) => studentIds.includes(s.studentId));
  }

  // Filter for essays only (for grading queue)
  if (filters.hasEssayOnly) {
    submissions = submissions.filter((submission) => {
      const questions = getQuestionsByAssignmentId(submission.assignmentId);
      return questions.some((q) => q.type === 'essay');
    });
  }

  // Transform to list items
  return submissions.map((submission) => {
    const student = getStudentById(submission.studentId);
    const assignment = getAssignmentById(submission.assignmentId);
    const classInfo = assignment ? getClassById(assignment.classId) : null;
    const questions = getQuestionsByAssignmentId(submission.assignmentId);
    const answers = getAnswersBySubmissionId(submission.id);

    const essayQuestions = questions.filter((q) => q.type === 'essay');
    const mcqQuestions = questions.filter((q) => q.type === 'mcq');

    const mcqMaxScore = mcqQuestions.reduce((sum, q) => sum + q.maxScore, 0);
    const totalMaxScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

    // Calculate MCQ score from answers
    const mcqScore = answers
      .filter((a) => {
        const q = questions.find((q) => q.id === a.questionId);
        return q?.type === 'mcq';
      })
      .reduce((sum, a) => sum + (a.score || 0), 0);

    return {
      id: submission.id,
      studentId: submission.studentId,
      studentName: student?.name || 'Unknown',
      studentAvatar: student?.avatarUrl,
      assignmentId: submission.assignmentId,
      assignmentTitle: assignment?.title || 'Unknown',
      assignmentType: assignment?.type || 'homework',
      className: classInfo?.name || 'Unknown',
      status: submission.status,
      submittedAt: submission.submittedAt,
      totalScore: submission.totalScore,
      maxScore: totalMaxScore,
      hasEssay: essayQuestions.length > 0,
      essayCount: essayQuestions.length,
      mcqScore,
      mcqMaxScore,
    };
  });
}

export function getSubmissionDetail(id: string): SubmissionDetail | null {
  const submission = getSubmissionById(id);
  if (!submission) return null;

  const student = getStudentById(submission.studentId);
  if (!student) return null;

  const assignment = getAssignmentById(submission.assignmentId);
  if (!assignment) return null;

  const classInfo = getClassById(assignment.classId);
  const questions = getQuestionsByAssignmentId(submission.assignmentId);
  const answers = getAnswersBySubmissionId(id);

  const maxScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

  // Combine answers with their questions
  const answersWithQuestions: SubmissionAnswerDetail[] = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId)!;
    return {
      ...answer,
      question,
    };
  });

  // Sort by question order
  answersWithQuestions.sort((a, b) => a.question.order - b.question.order);

  return {
    ...submission,
    student,
    assignment: {
      id: assignment.id,
      title: assignment.title,
      type: assignment.type,
      durationMinutes: assignment.durationMinutes,
    },
    className: classInfo?.name || 'Unknown',
    answers: answersWithQuestions,
    maxScore,
  };
}

export function gradeSubmission(id: string, payload: GradeSubmissionPayload): SubmissionDetail | null {
  const submission = getSubmissionById(id);
  if (!submission) return null;

  // Update individual answer scores
  updateAnswersInStore(id, payload.answers);

  // Get updated answers and calculate total score
  const answers = getAnswersBySubmissionId(id);
  const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);

  // Calculate auto vs manual scores
  const questions = getQuestionsByAssignmentId(submission.assignmentId);
  let autoScore = 0;
  let manualScore = 0;

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question?.type === 'mcq') {
      autoScore += answer.score || 0;
    } else {
      manualScore += answer.score || 0;
    }
  });

  // Update submission
  updateSubmissionInStore(id, {
    status: 'graded',
    gradedAt: new Date().toISOString(),
    totalScore,
    autoScore,
    manualScore,
    teacherOverallComment: payload.overallComment || null,
  });

  return getSubmissionDetail(id);
}

// ============================================================
// Student Repository (for student flow)
// ============================================================

/**
 * Get or create a submission for a student doing an assignment.
 * If an existing non-graded submission exists, return it.
 * Otherwise, create a new one with empty answers.
 */
export function getOrCreateSubmission(
  studentId: string,
  assignmentId: string
): SubmissionDetail | null {
  // Check if assignment exists
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) return null;

  // Check if student exists
  const student = getStudentById(studentId);
  if (!student) return null;

  // Find existing submission
  let submission = findSubmission(studentId, assignmentId);

  // If exists and not graded, return it
  if (submission && submission.status !== 'graded') {
    return getSubmissionDetail(submission.id);
  }

  // If graded or doesn't exist, create new submission
  const now = new Date().toISOString();
  const submissionId = generateSubmissionId();

  const newSubmission: Submission = {
    id: submissionId,
    assignmentId,
    studentId,
    status: 'in_progress',
    startedAt: now,
    submittedAt: null,
    gradedAt: null,
    totalScore: null,
    autoScore: null,
    manualScore: null,
    teacherOverallComment: null,
  };

  addSubmission(newSubmission);

  // Create empty answers for each question
  const questions = getQuestionsByAssignmentId(assignmentId);
  const newAnswers: SubmissionAnswer[] = questions.map((q) => ({
    id: generateAnswerId(),
    submissionId,
    questionId: q.id,
    selectedChoiceIndex: q.type === 'mcq' ? null : undefined,
    answerText: q.type === 'essay' ? '' : undefined,
    isCorrect: null,
    score: null,
    aiSuggestion: null,
    teacherComment: null,
  }));

  addAnswers(newAnswers);

  return getSubmissionDetail(submissionId);
}

/**
 * Update student answers while doing assignment (not submitting yet).
 */
export function updateStudentSubmissionAnswers(
  submissionId: string,
  answers: Array<{
    questionId: string;
    selectedChoiceIndex?: number | null;
    answerText?: string | null;
  }>
): SubmissionDetail | null {
  const submission = getSubmissionById(submissionId);
  if (!submission) return null;

  // Only allow updates if in_progress
  if (submission.status !== 'in_progress') {
    return null;
  }

  updateStudentAnswers(submissionId, answers);
  return getSubmissionDetail(submissionId);
}

/**
 * Submit assignment (student finishes).
 * - Auto-grade MCQ questions
 * - Set status to submitted
 */
export function submitStudentSubmission(submissionId: string): SubmissionDetail | null {
  const submission = getSubmissionById(submissionId);
  if (!submission) return null;

  // Only allow submit if in_progress
  if (submission.status !== 'in_progress') {
    return null;
  }

  const questions = getQuestionsByAssignmentId(submission.assignmentId);
  const answers = getAnswersBySubmissionId(submissionId);

  // Auto-grade MCQ questions
  let autoScore = 0;
  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    if (question.type === 'mcq') {
      const isCorrect = answer.selectedChoiceIndex === question.correctAnswerIndex;
      const score = isCorrect ? question.maxScore : 0;

      // Update answer
      const answerIndex = mockSubmissionAnswers.findIndex((a) => a.id === answer.id);
      if (answerIndex !== -1) {
        mockSubmissionAnswers[answerIndex].isCorrect = isCorrect;
        mockSubmissionAnswers[answerIndex].score = score;
      }

      autoScore += score;
    }
    // Essay questions: leave score as null, will be graded by teacher
  });

  // Update submission
  updateSubmissionInStore(submissionId, {
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    autoScore,
  });

  return getSubmissionDetail(submissionId);
}

/**
 * Get submissions for a specific student.
 */
export function getStudentSubmissions(studentId: string): SubmissionListItem[] {
  return getSubmissions({ }).filter((s) => s.studentId === studentId);
}

/**
 * Get published assignments for student's class.
 */
export function getAssignmentsForStudent(studentId: string): AssignmentWithStats[] {
  const student = getStudentById(studentId);
  if (!student) return [];

  return getAssignments({ status: 'published', classId: student.classId });
}

// ============================================================
// Helper Exports
// ============================================================

export {
  getStudentById,
  getStudentsByClassId,
  getQuestionsByAssignmentId,
  getMaxScoreByAssignmentId,
  findSubmission,
};
