import { NextRequest, NextResponse } from 'next/server';
import {
  getAssignmentDetail,
  updateAssignment,
  deleteAssignment,
} from '@/data/mock/repo';
import { UpdateAssignmentPayload } from '@/types/domain';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/mock/assignments/[id]
 *
 * Get assignment detail with questions.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const assignment = getAssignmentDetail(id);

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/mock/assignments/[id]
 *
 * Update assignment fields (status, title, settings, etc.)
 *
 * Body: UpdateAssignmentPayload
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if assignment exists
    const existing = getAssignmentDetail(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const payload: UpdateAssignmentPayload = {};

    // Only include fields that are provided
    if (body.title !== undefined) payload.title = body.title;
    if (body.description !== undefined) payload.description = body.description;
    if (body.type !== undefined) payload.type = body.type;
    if (body.status !== undefined) payload.status = body.status;
    if (body.durationMinutes !== undefined) payload.durationMinutes = body.durationMinutes;
    if (body.dueAt !== undefined) payload.dueAt = body.dueAt;
    if (body.settings !== undefined) payload.settings = body.settings;

    const updated = updateAssignment(id, payload);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mock/assignments/[id]
 *
 * Delete an assignment and its questions.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if assignment exists
    const existing = getAssignmentDetail(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const deleted = deleteAssignment(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
