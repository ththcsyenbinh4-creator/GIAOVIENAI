import { Student } from '@/types/domain';

/**
 * Mock Students Data
 *
 * Sample students across different classes.
 * In production, this would be fetched from the database.
 */
export const mockStudents: Student[] = [
  // Class 8A students
  {
    id: 'student-1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@student.edu.vn',
    classId: 'class-8a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@student.edu.vn',
    classId: 'class-8a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-3',
    name: 'Lê Văn Cường',
    email: 'cuong.le@student.edu.vn',
    classId: 'class-8a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@student.edu.vn',
    classId: 'class-8a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-5',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@student.edu.vn',
    classId: 'class-8a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },

  // Class 8B students
  {
    id: 'student-6',
    name: 'Ngô Thị Phương',
    email: 'phuong.ngo@student.edu.vn',
    classId: 'class-8b',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-7',
    name: 'Vũ Văn Quang',
    email: 'quang.vu@student.edu.vn',
    classId: 'class-8b',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-8',
    name: 'Đặng Thị Hương',
    email: 'huong.dang@student.edu.vn',
    classId: 'class-8b',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-9',
    name: 'Bùi Văn Sơn',
    email: 'son.bui@student.edu.vn',
    classId: 'class-8b',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-10',
    name: 'Đinh Thị Tâm',
    email: 'tam.dinh@student.edu.vn',
    classId: 'class-8b',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },

  // Class 9A students
  {
    id: 'student-11',
    name: 'Lý Văn Uy',
    email: 'uy.ly@student.edu.vn',
    classId: 'class-9a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-12',
    name: 'Mai Thị Vân',
    email: 'van.mai@student.edu.vn',
    classId: 'class-9a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-13',
    name: 'Trịnh Văn Xuân',
    email: 'xuan.trinh@student.edu.vn',
    classId: 'class-9a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-14',
    name: 'Cao Thị Yến',
    email: 'yen.cao@student.edu.vn',
    classId: 'class-9a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'student-15',
    name: 'Dương Văn Zũng',
    email: 'zung.duong@student.edu.vn',
    classId: 'class-9a',
    avatarUrl: null,
    createdAt: '2024-09-01T08:00:00Z',
  },
];

// Helper to get student by ID
export function getStudentById(id: string): Student | undefined {
  return mockStudents.find((s) => s.id === id);
}

// Helper to get students by class
export function getStudentsByClassId(classId: string): Student[] {
  return mockStudents.filter((s) => s.classId === classId);
}
