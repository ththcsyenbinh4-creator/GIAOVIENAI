import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions, getOrCreateSubmission } from '@/data/mock/repo';
import { SubmissionFilters, SubmissionStatus } from '@/types/domain';

/**
 * GET /api/mock/submissions
 *
 * Get list of submissions with optional filters.
 * Used for the grading queue ("Danh sách chấm bài").
 *
 * Query params:
 * - status: 'in_progress' | 'submitted' | 'graded'
 * - assignmentId: string
 * - classId: string
 * - hasEssayOnly: 'true' (filter to only submissions with essay questions)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: SubmissionFilters = {};

    const status = searchParams.get('status');
    if (status && ['in_progress', 'submitted', 'graded'].includes(status)) {
      filters.status = status as SubmissionStatus;
    }

    const assignmentId = searchParams.get('assignmentId');
    if (assignmentId) {
      filters.assignmentId = assignmentId;
    }

    const classId = searchParams.get('classId');
    if (classId) {
      filters.classId = classId;
    }

    const hasEssayOnly = searchParams.get('hasEssayOnly');
    if (hasEssayOnly === 'true') {
      filters.hasEssayOnly = true;
    }

    const submissions = getSubmissions(filters);

    // Calculate summary stats
    const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
    const gradedCount = submissions.filter((s) => s.status === 'graded').length;
    const totalEssayCount = submissions
      .filter((s) => s.status === 'submitted')
      .reduce((sum, s) => sum + s.essayCount, 0);

    return NextResponse.json({
      success: true,
      data: submissions,
      meta: {
        total: submissions.length,
        pendingCount,
        gradedCount,
        totalEssayCount,
        filters,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mock/submissions
 *
 * Create or get existing submission for a student doing an assignment.
 * Used when student starts an assignment.
 *
 * Body:
 * - assignmentId: string
 * - studentId: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, studentId } = body;

    if (!assignmentId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'assignmentId and studentId are required' },
        { status: 400 }
      );
    }

    const submission = getOrCreateSubmission(studentId, assignmentId);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Assignment or student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
