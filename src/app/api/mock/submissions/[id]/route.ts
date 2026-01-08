import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionDetail, updateStudentSubmissionAnswers } from '@/data/mock/repo';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/mock/submissions/[id]
 *
 * Get submission detail with student info, assignment info, and answers.
 * Used for the grading detail page.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const submission = getSubmissionDetail(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/mock/submissions/[id]
 *
 * Update student answers while doing assignment.
 * Only allowed if submission status is 'in_progress'.
 *
 * Body:
 * - answers: Array<{ questionId: string; selectedChoiceIndex?: number; answerText?: string }>
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'answers array is required' },
        { status: 400 }
      );
    }

    const submission = updateStudentSubmissionAnswers(id, answers);

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
    console.error('Error updating submission answers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update answers' },
      { status: 500 }
    );
  }
}
