import { NextRequest, NextResponse } from 'next/server';
import { gradeSubmission, getSubmissionDetail } from '@/data/mock/repo';
import { GradeSubmissionPayload } from '@/types/domain';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/mock/submissions/[id]/grade
 *
 * Grade a submission by updating answer scores and comments.
 *
 * Body: GradeSubmissionPayload
 * {
 *   answers: [
 *     { questionId: string, score: number, teacherComment?: string }
 *   ],
 *   overallComment?: string
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if submission exists
    const existing = getSubmissionDetail(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Validate body
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { success: false, error: 'Answers array is required' },
        { status: 400 }
      );
    }

    // Validate each answer
    for (const answer of body.answers) {
      if (!answer.questionId) {
        return NextResponse.json(
          { success: false, error: 'Each answer must have a questionId' },
          { status: 400 }
        );
      }
      if (typeof answer.score !== 'number' || answer.score < 0) {
        return NextResponse.json(
          { success: false, error: 'Each answer must have a valid score >= 0' },
          { status: 400 }
        );
      }

      // Check that score doesn't exceed max score
      const answerDetail = existing.answers.find((a) => a.questionId === answer.questionId);
      if (answerDetail && answer.score > answerDetail.question.maxScore) {
        return NextResponse.json(
          {
            success: false,
            error: `Score for question ${answer.questionId} exceeds max score of ${answerDetail.question.maxScore}`,
          },
          { status: 400 }
        );
      }
    }

    const payload: GradeSubmissionPayload = {
      answers: body.answers.map((a: { questionId: string; score: number; teacherComment?: string }) => ({
        questionId: a.questionId,
        score: a.score,
        teacherComment: a.teacherComment,
      })),
      overallComment: body.overallComment,
    };

    const graded = gradeSubmission(id, payload);

    if (!graded) {
      return NextResponse.json(
        { success: false, error: 'Failed to grade submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: graded,
      message: 'Submission graded successfully',
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}
