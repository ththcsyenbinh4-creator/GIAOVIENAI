/**
 * API Client
 *
 * Provides a clean interface for making API calls.
 * Automatically switches between mock and real API based on environment config.
 *
 * Usage:
 * - Set NEXT_PUBLIC_USE_MOCK_API=true in .env.local for mock API
 * - Set NEXT_PUBLIC_USE_MOCK_API=false (or remove) for real API
 */

import {
  AssignmentWithStats,
  AssignmentDetail,
  AssignmentFilters,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  SubmissionListItem,
  SubmissionDetail,
  SubmissionFilters,
  GradeSubmissionPayload,
  GenerateQuestionsRequest,
  GeneratedQuestion,
  GradeEssayRequest,
  GradeEssayResponse,
  StudentAnswerUpdate,
} from '@/types/domain';

// ============================================================
// Configuration
// ============================================================

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
const BASE_PATH = USE_MOCK_API ? '/api/mock' : '/api';

// ============================================================
// Types
// ============================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
  message?: string;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

// ============================================================
// Core Fetch Helper
// ============================================================

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${BASE_PATH}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================
// Assignment API
// ============================================================

/**
 * Fetch list of assignments with optional filters.
 */
export async function fetchAssignments(
  filters: AssignmentFilters = {}
): Promise<ApiResponse<AssignmentWithStats[]>> {
  return apiFetch<AssignmentWithStats[]>('/assignments', {
    params: {
      status: filters.status,
      classId: filters.classId,
      type: filters.type,
      search: filters.search,
    },
  });
}

/**
 * Fetch single assignment with questions.
 */
export async function fetchAssignmentDetail(
  id: string
): Promise<ApiResponse<AssignmentDetail>> {
  return apiFetch<AssignmentDetail>(`/assignments/${id}`);
}

/**
 * Create a new assignment with questions.
 */
export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<ApiResponse<AssignmentDetail>> {
  return apiFetch<AssignmentDetail>('/assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing assignment.
 */
export async function updateAssignment(
  id: string,
  payload: UpdateAssignmentPayload
): Promise<ApiResponse<AssignmentDetail>> {
  return apiFetch<AssignmentDetail>(`/assignments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete an assignment.
 */
export async function deleteAssignment(id: string): Promise<ApiResponse<void>> {
  return apiFetch<void>(`/assignments/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Publish a draft assignment.
 */
export async function publishAssignment(
  id: string
): Promise<ApiResponse<AssignmentDetail>> {
  return updateAssignment(id, { status: 'published' });
}

/**
 * Duplicate an assignment.
 */
export async function duplicateAssignment(
  id: string
): Promise<ApiResponse<AssignmentDetail>> {
  // Fetch original
  const original = await fetchAssignmentDetail(id);
  if (!original.success || !original.data) {
    return { success: false, error: 'Original assignment not found' };
  }

  // Create copy with "Copy of" prefix
  const { questions, ...assignment } = original.data;
  return createAssignment({
    ...assignment,
    title: `Bản sao - ${assignment.title}`,
    status: 'draft',
    dueAt: null,
    questions: questions.map((q) => ({
      order: q.order,
      type: q.type,
      prompt: q.prompt,
      choices: q.choices,
      correctAnswerIndex: q.correctAnswerIndex,
      maxScore: q.maxScore,
      source: q.source,
    })),
  });
}

// ============================================================
// Submission API
// ============================================================

/**
 * Fetch list of submissions (for grading queue).
 */
export async function fetchSubmissions(
  filters: SubmissionFilters = {}
): Promise<ApiResponse<SubmissionListItem[]>> {
  return apiFetch<SubmissionListItem[]>('/submissions', {
    params: {
      status: filters.status,
      assignmentId: filters.assignmentId,
      classId: filters.classId,
      hasEssayOnly: filters.hasEssayOnly ? 'true' : undefined,
    },
  });
}

/**
 * Fetch pending submissions (shortcut for grading queue).
 */
export async function fetchPendingSubmissions(): Promise<
  ApiResponse<SubmissionListItem[]>
> {
  return fetchSubmissions({ status: 'submitted' });
}

/**
 * Fetch graded submissions.
 */
export async function fetchGradedSubmissions(): Promise<
  ApiResponse<SubmissionListItem[]>
> {
  return fetchSubmissions({ status: 'graded' });
}

/**
 * Fetch single submission with answers.
 */
export async function fetchSubmissionDetail(
  id: string
): Promise<ApiResponse<SubmissionDetail>> {
  return apiFetch<SubmissionDetail>(`/submissions/${id}`);
}

/**
 * Grade a submission.
 */
export async function gradeSubmission(
  id: string,
  payload: GradeSubmissionPayload
): Promise<ApiResponse<SubmissionDetail>> {
  return apiFetch<SubmissionDetail>(`/submissions/${id}/grade`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================
// AI API
// ============================================================

/**
 * Generate questions using AI.
 */
export async function generateQuestions(
  request: GenerateQuestionsRequest
): Promise<ApiResponse<{ questions: GeneratedQuestion[] }>> {
  return apiFetch<{ questions: GeneratedQuestion[] }>('/ai/generate-questions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Grade an essay using AI.
 */
export async function gradeEssay(
  request: GradeEssayRequest
): Promise<ApiResponse<GradeEssayResponse>> {
  return apiFetch<GradeEssayResponse>('/ai/grade-essay', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ============================================================
// Student API
// ============================================================

/**
 * Start or continue an assignment (student).
 * Creates a new submission if one doesn't exist, or returns existing in_progress submission.
 */
export async function startAssignment(
  assignmentId: string,
  studentId: string
): Promise<ApiResponse<SubmissionDetail>> {
  return apiFetch<SubmissionDetail>('/submissions', {
    method: 'POST',
    body: JSON.stringify({ assignmentId, studentId }),
  });
}

/**
 * Update answers while doing assignment (student).
 * Only works if submission is in_progress.
 */
export async function updateSubmissionAnswers(
  submissionId: string,
  answers: StudentAnswerUpdate[]
): Promise<ApiResponse<SubmissionDetail>> {
  return apiFetch<SubmissionDetail>(`/submissions/${submissionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ answers }),
  });
}

/**
 * Submit assignment (student finishes).
 * Auto-grades MCQs and changes status to 'submitted'.
 */
export async function submitAssignment(
  submissionId: string
): Promise<ApiResponse<SubmissionDetail>> {
  return apiFetch<SubmissionDetail>(`/submissions/${submissionId}/submit`, {
    method: 'POST',
  });
}

/**
 * Fetch assignments available for a student.
 */
export async function fetchStudentAssignments(
  studentId: string
): Promise<ApiResponse<AssignmentWithStats[]>> {
  return apiFetch<AssignmentWithStats[]>('/assignments', {
    params: {
      status: 'published',
    },
  });
}

/**
 * Fetch student's submissions history.
 */
export async function fetchStudentSubmissions(
  studentId: string
): Promise<ApiResponse<SubmissionListItem[]>> {
  return fetchSubmissions({});
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Check if we're using the mock API.
 */
export function isUsingMockApi(): boolean {
  return USE_MOCK_API;
}

/**
 * Get the base API path.
 */
export function getApiBasePath(): string {
  return BASE_PATH;
}
