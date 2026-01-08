'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'teacher' | 'student';
}

// Mock search results
const mockResults = {
  teacher: {
    assignments: [
      { id: '1', title: 'Bài kiểm tra Chương 3: Hàm số', class: 'Lớp 8A', type: 'exam' },
      { id: '2', title: 'Bài tập về nhà: Phương trình', class: 'Lớp 8B', type: 'homework' },
    ],
    classes: [
      { id: '1', name: 'Lớp 8A', students: 50 },
      { id: '2', name: 'Lớp 8B', students: 48 },
      { id: '3', name: 'Lớp 9A', students: 52 },
    ],
    students: [
      { id: '1', name: 'Nguyễn Văn A', class: 'Lớp 8A' },
      { id: '2', name: 'Trần Thị B', class: 'Lớp 8A' },
    ],
  },
  student: {
    assignments: [
      { id: '1', title: 'Bài kiểm tra Chương 3: Hàm số', subject: 'Toán học', deadline: '20/12' },
      { id: '2', title: 'Bài tập về nhà: Phương trình', subject: 'Toán học', deadline: '18/12' },
      { id: '3', title: 'Ôn tập từ vựng Unit 5', subject: 'Tiếng Anh', deadline: '19/12' },
    ],
    results: [
      { id: '1', title: 'Bài kiểm tra Chương 2', subject: 'Toán học', score: '8.5/10' },
      { id: '2', title: 'Bài tập Unit 4', subject: 'Tiếng Anh', score: '9/10' },
    ],
  },
};

const quickActions = {
  teacher: [
    { label: 'Tạo bài tập mới', href: '/giao-vien/bai-tap/tao-moi', icon: CheckCircle },
    { label: 'Xem lớp học', href: '/giao-vien/lop-hoc', icon: Users },
    { label: 'Chấm bài', href: '/giao-vien/cham-bai', icon: FileText },
  ],
  student: [
    { label: 'Bài tập của tôi', href: '/hoc-sinh/bai-tap', icon: CheckCircle },
    { label: 'Kết quả học tập', href: '/hoc-sinh/ket-qua', icon: FileText },
  ],
};

export function SearchModal({ isOpen, onClose, userRole }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  const results = mockResults[userRole];
  const actions = quickActions[userRole];
  const hasQuery = query.length > 0;

  // Filter results based on query
  const filteredAssignments = hasQuery
    ? (userRole === 'teacher' ? results.assignments : results.assignments).filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl bg-[var(--bg-surface)] shadow-strong animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--border-default)]">
          <Search className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm bài tập, lớp học, học sinh..."
            className="flex-1 h-14 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
          {query && (
            <Button variant="ghost" size="icon-sm" onClick={() => setQuery('')}>
              <X className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-soft)] text-xs text-[var(--text-tertiary)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!hasQuery ? (
            <>
              {/* Quick Actions */}
              <div className="p-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
                  Thao tác nhanh
                </p>
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.href}
                      onClick={() => handleNavigate(action.href)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--bg-soft)] transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-soft)]">
                        <Icon className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{action.label}</span>
                      <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] ml-auto" strokeWidth={1.75} />
                    </button>
                  );
                })}
              </div>

              {/* Recent */}
              <div className="p-2 mt-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
                  Bài tập gần đây
                </p>
                {results.assignments.slice(0, 3).map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => handleNavigate(
                      userRole === 'teacher'
                        ? `/giao-vien/bai-tap/${assignment.id}`
                        : `/hoc-sinh/bai-tap/${assignment.id}`
                    )}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--bg-soft)] transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-soft)]">
                      <FileText className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">{assignment.title}</p>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        {'class' in assignment ? assignment.class : assignment.subject}
                      </p>
                    </div>
                    {'deadline' in assignment && (
                      <Badge variant="default" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" strokeWidth={1.75} />
                        {assignment.deadline}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Search Results */}
              {filteredAssignments.length > 0 ? (
                <div className="p-2">
                  <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
                    Bài tập ({filteredAssignments.length})
                  </p>
                  {filteredAssignments.map((assignment) => (
                    <button
                      key={assignment.id}
                      onClick={() => handleNavigate(
                        userRole === 'teacher'
                          ? `/giao-vien/bai-tap/${assignment.id}`
                          : `/hoc-sinh/bai-tap/${assignment.id}`
                      )}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--bg-soft)] transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-soft)]">
                        <FileText className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">{assignment.title}</p>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {'class' in assignment ? assignment.class : assignment.subject}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                  <p className="text-[var(--text-secondary)]">Không tìm thấy kết quả cho "{query}"</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">Thử tìm với từ khóa khác</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)]">↓</kbd>
              để di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)]">Enter</kbd>
              để chọn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
