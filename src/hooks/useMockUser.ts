/**
 * Mock User Hook
 *
 * Provides mock user context for prototype mode.
 * In production, this should be replaced with real Supabase auth.
 *
 * TODO: Replace with real authentication in Phase 2
 */

import { useMemo } from 'react';

interface MockUser {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  name: string;
}

interface MockUserContext {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock student for prototype mode
const MOCK_STUDENT: MockUser = {
  id: 'student-1',
  email: 'student@example.com',
  role: 'student',
  name: 'Nguyễn Văn A',
};

// Mock teacher for prototype mode
const MOCK_TEACHER: MockUser = {
  id: 'teacher-1',
  email: 'teacher@example.com',
  role: 'teacher',
  name: 'Trần Thị B',
};

/**
 * Hook to get mock user based on current route.
 * Returns mock student for /hoc-sinh/* routes.
 * Returns mock teacher for /giao-vien/* routes.
 */
export function useMockUser(role?: 'teacher' | 'student'): MockUserContext {
  const user = useMemo(() => {
    // If role is explicitly provided, use it
    if (role === 'teacher') return MOCK_TEACHER;
    if (role === 'student') return MOCK_STUDENT;

    // Default to student for student routes
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/giao-vien')) return MOCK_TEACHER;
      if (path.startsWith('/hoc-sinh')) return MOCK_STUDENT;
    }

    return MOCK_STUDENT;
  }, [role]);

  return {
    user,
    isAuthenticated: true, // Always true in mock mode
    isLoading: false,
  };
}

/**
 * Get current student ID for mock mode.
 * Use this function in client components that need student ID.
 */
export function getMockStudentId(): string {
  return MOCK_STUDENT.id;
}

/**
 * Get current teacher ID for mock mode.
 * Use this function in client components that need teacher ID.
 */
export function getMockTeacherId(): string {
  return MOCK_TEACHER.id;
}
