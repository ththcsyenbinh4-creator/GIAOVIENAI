import { NextRequest, NextResponse } from 'next/server';
import { submitStudentSubmission } from '@/data/mock/repo';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/mock/submissions/[id]/submit
 *
 * Submit the assignment (student finishes).
 * - Auto-grades MCQ questions
 * - Changes status from 'in_progress' to 'submitted'
 * - Only allowed if submission status is 'in_progress'
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const submission = submitStudentSubmission(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found or already submitted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}
