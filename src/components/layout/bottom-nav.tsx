'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  PenLine,
  BarChart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    href: '/giao-vien/ho-so',
    label: 'Hồ sơ',
    icon: <User className="h-5 w-5" strokeWidth={1.75} />,
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
  {
    href: '/hoc-sinh/ho-so',
    label: 'Hồ sơ',
    icon: <User className="h-5 w-5" strokeWidth={1.75} />,
  },
];

export interface BottomNavProps {
  userRole: 'teacher' | 'student';
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = userRole === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border-default)] safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
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
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors',
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
