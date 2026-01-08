import { Assignment } from '@/types/domain';

/**
 * Mock Assignments Data
 *
 * Sample assignments with different types and statuses.
 * In production, this would be fetched from the database.
 */
export let mockAssignments: Assignment[] = [
  {
    id: 'assg-1',
    title: 'Bài kiểm tra Chương 3: Hàm số bậc nhất',
    description: 'Kiểm tra kiến thức về hàm số bậc nhất và đồ thị',
    classId: 'class-8a',
    type: 'test',
    status: 'published',
    durationMinutes: 45,
    dueAt: '2024-12-20T23:59:00Z',
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2024-12-10T10:30:00Z',
    settings: {
      shuffleQuestions: true,
      shuffleAnswers: true,
      showCorrectAfterSubmit: false,
      maxAttempts: 1,
    },
  },
  {
    id: 'assg-2',
    title: 'Bài tập về nhà: Phương trình bậc nhất',
    description: 'Luyện tập giải phương trình bậc nhất một ẩn',
    classId: 'class-8a',
    type: 'homework',
    status: 'published',
    durationMinutes: null,
    dueAt: '2024-12-18T23:59:00Z',
    createdAt: '2024-12-08T14:00:00Z',
    updatedAt: '2024-12-08T14:00:00Z',
    settings: {
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAfterSubmit: true,
      maxAttempts: 3,
    },
  },
  {
    id: 'assg-3',
    title: 'Kiểm tra nhanh: Đồ thị hàm số',
    description: 'Kiểm tra 15 phút về cách vẽ đồ thị hàm số',
    classId: 'class-8b',
    type: 'quiz',
    status: 'published',
    durationMinutes: 15,
    dueAt: '2024-12-17T10:00:00Z',
    createdAt: '2024-12-05T09:00:00Z',
    updatedAt: '2024-12-05T09:30:00Z',
    settings: {
      shuffleQuestions: true,
      shuffleAnswers: true,
      showCorrectAfterSubmit: true,
      maxAttempts: 1,
    },
  },
  {
    id: 'assg-4',
    title: 'Ôn tập cuối kỳ I',
    description: 'Tổng hợp kiến thức học kỳ I môn Toán',
    classId: 'class-9a',
    type: 'test',
    status: 'draft',
    durationMinutes: 90,
    dueAt: null,
    createdAt: '2024-12-12T16:00:00Z',
    updatedAt: '2024-12-12T18:00:00Z',
    settings: {
      shuffleQuestions: true,
      shuffleAnswers: true,
      showCorrectAfterSubmit: false,
      maxAttempts: 1,
    },
  },
  {
    id: 'assg-5',
    title: 'Bài tập Hình học: Tam giác đồng dạng',
    description: 'Bài tập về các trường hợp đồng dạng của tam giác',
    classId: 'class-8b',
    type: 'homework',
    status: 'draft',
    durationMinutes: null,
    dueAt: null,
    createdAt: '2024-12-14T10:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
    settings: {
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAfterSubmit: true,
      maxAttempts: null,
    },
  },
];

// Counter for generating new IDs
let assignmentIdCounter = 6;

// Helper to generate new assignment ID
export function generateAssignmentId(): string {
  return `assg-${assignmentIdCounter++}`;
}

// Helper to get assignment by ID
export function getAssignmentById(id: string): Assignment | undefined {
  return mockAssignments.find((a) => a.id === id);
}

// Helper to add assignment
export function addAssignment(assignment: Assignment): void {
  mockAssignments.push(assignment);
}

// Helper to update assignment
export function updateAssignmentInStore(id: string, updates: Partial<Assignment>): Assignment | null {
  const index = mockAssignments.findIndex((a) => a.id === id);
  if (index === -1) return null;

  mockAssignments[index] = { ...mockAssignments[index], ...updates };
  return mockAssignments[index];
}

// Helper to delete assignment
export function deleteAssignmentFromStore(id: string): boolean {
  const index = mockAssignments.findIndex((a) => a.id === id);
  if (index === -1) return false;

  mockAssignments.splice(index, 1);
  return true;
}
