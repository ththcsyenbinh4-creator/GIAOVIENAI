import { NextRequest, NextResponse } from 'next/server';
import {
  getAssignments,
  createAssignment,
} from '@/data/mock/repo';
import {
  AssignmentFilters,
  AssignmentStatus,
  AssignmentType,
  CreateAssignmentPayload,
} from '@/types/domain';

/**
 * GET /api/mock/assignments
 *
 * Get list of assignments with optional filters.
 *
 * Query params:
 * - status: 'draft' | 'published'
 * - classId: string
 * - type: 'homework' | 'quiz' | 'test'
 * - search: string (match title substring)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: AssignmentFilters = {};

    const status = searchParams.get('status');
    if (status && (status === 'draft' || status === 'published')) {
      filters.status = status as AssignmentStatus;
    }

    const classId = searchParams.get('classId');
    if (classId) {
      filters.classId = classId;
    }

    const type = searchParams.get('type');
    if (type && ['homework', 'quiz', 'test'].includes(type)) {
      filters.type = type as AssignmentType;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const assignments = getAssignments(filters);

    return NextResponse.json({
      success: true,
      data: assignments,
      meta: {
        total: assignments.length,
        filters,
      },
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mock/assignments
 *
 * Create a new assignment with questions.
 *
 * Body: CreateAssignmentPayload
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.classId || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, classId, type' },
        { status: 400 }
      );
    }

    if (!body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { success: false, error: 'Questions array is required' },
        { status: 400 }
      );
    }

    const payload: CreateAssignmentPayload = {
      title: body.title,
      description: body.description || '',
      classId: body.classId,
      type: body.type,
      status: body.status || 'draft',
      durationMinutes: body.durationMinutes || null,
      dueAt: body.dueAt || null,
      settings: body.settings || {
        shuffleQuestions: false,
        shuffleAnswers: false,
        showCorrectAfterSubmit: true,
        maxAttempts: null,
      },
      questions: body.questions,
    };

    const assignment = createAssignment(payload);

    return NextResponse.json({
      success: true,
      data: assignment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
