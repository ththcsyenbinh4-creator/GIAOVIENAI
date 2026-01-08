'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { FloatingActions } from '@/components/layout/floating-actions';
import { FloatingActionsProvider } from '@/components/layout/floating-actions-context';
import { useMockUser } from '@/hooks/useMockUser';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useMockUser('student');

  // PHASE 2: Replace useMockUser with real Supabase auth
  const userName = user?.name || 'Học sinh';

  return (
    <FloatingActionsProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole="student"
          userName={userName}
        />

        {/* Floating Actions - Search & Notifications */}
        <FloatingActions
          userRole="student"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Main Content - Full height, no header */}
        <main className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-6">
            {children}
          </div>
        </main>

        {/* Bottom Navigation - Mobile */}
        <BottomNav userRole="student" />
      </div>
    </FloatingActionsProvider>
  );
}
