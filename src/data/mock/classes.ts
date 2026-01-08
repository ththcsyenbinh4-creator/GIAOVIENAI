import { Class } from '@/types/domain';

/**
 * Mock Classes Data
 *
 * Sample classes for the prototype.
 * In production, this would be fetched from the database.
 */
export const mockClasses: Class[] = [
  {
    id: 'class-8a',
    name: 'Lớp 8A',
    grade: 8,
    studentCount: 35,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'class-8b',
    name: 'Lớp 8B',
    grade: 8,
    studentCount: 32,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'class-9a',
    name: 'Lớp 9A',
    grade: 9,
    studentCount: 38,
    createdAt: '2024-09-01T08:00:00Z',
  },
];

// Helper to get class by ID
export function getClassById(id: string): Class | undefined {
  return mockClasses.find((c) => c.id === id);
}

// Helper to get class name
export function getClassName(classId: string): string {
  return getClassById(classId)?.name || 'Unknown Class';
}
