'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  PenLine,
  FileText,
  BarChart,
  Settings,
  LogOut,
  X,
  Sparkles,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'teacher' | 'student';
  userName: string;
  userGender?: 'male' | 'female';
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const teacherNavItems: NavItem[] = [
  {
    href: '/giao-vien',
    label: 'Tổng quan',
    icon: <LayoutDashboard className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/giao-vien/lop-hoc',
    label: 'Lớp học',
    icon: <Users className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/giao-vien/bai-tap',
    label: 'Bài tập',
    icon: <CheckCircle className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/giao-vien/cham-bai',
    label: 'Chấm bài',
    icon: <PenLine className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/giao-vien/tai-lieu',
    label: 'Tài liệu',
    icon: <FileText className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/giao-vien/thong-ke',
    label: 'Thống kê',
    icon: <BarChart className="h-5 w-5" strokeWidth={1.75} />,
  },
];

const studentNavItems: NavItem[] = [
  {
    href: '/hoc-sinh',
    label: 'Tổng quan',
    icon: <LayoutDashboard className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/hoc-sinh/bai-tap',
    label: 'Bài tập',
    icon: <CheckCircle className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    href: '/hoc-sinh/ket-qua',
    label: 'Kết quả',
    icon: <BarChart className="h-5 w-5" strokeWidth={1.75} />,
  },
];

export function Sidebar({ isOpen, onClose, userRole, userName, userGender = 'female' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = userRole === 'teacher' ? teacherNavItems : studentNavItems;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // PHASE 2: Replace with Supabase auth signOut
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/dang-nhap');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 bg-[var(--bg-surface)] shadow-strong transition-transform duration-300 md:static md:translate-x-0 md:shadow-none md:border-r md:border-[var(--border-default)] flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-default)] px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)]">
              <Sparkles className="h-5 w-5 text-[var(--btn-primary-text)]" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">Classroom AI</h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                {userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/giao-vien' &&
                item.href !== '/hoc-sinh' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--bg-soft)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border-default)] p-4 flex-shrink-0">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-[var(--bg-soft)] p-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              userGender === 'female'
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
            )}>
              <User className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-[var(--text-primary)]">{userName}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={userRole === 'teacher' ? '/giao-vien/cai-dat' : '/hoc-sinh/cai-dat'}
              onClick={onClose}
              className="flex-1"
            >
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" strokeWidth={1.75} />
                Cài đặt
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error hover:bg-error/10"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Đăng xuất"
      >
        <div className="py-4">
          <p className="text-[var(--text-secondary)]">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            Đăng xuất
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
