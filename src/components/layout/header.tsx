'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchModal } from './search-modal';
import { NotificationDropdown } from './notification-dropdown';

export interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotification?: boolean;
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
  userRole?: 'teacher' | 'student';
}

export function Header({
  title,
  showSearch = true,
  showNotification = true,
  onMenuClick,
  rightContent,
  userRole = 'student',
}: HeaderProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-[var(--border-default)]">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 relative">
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                title="Tìm kiếm (⌘K)"
              >
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            )}
            {showNotification && (
              <div className="relative">
                <Button
                  ref={notificationButtonRef}
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  title="Thông báo"
                >
                  <Bell className="h-5 w-5" strokeWidth={1.75} />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
                </Button>
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  userRole={userRole}
                  anchorRef={notificationButtonRef}
                />
              </div>
            )}
            {rightContent}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userRole={userRole}
      />
    </>
  );
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-title-lg font-bold text-[var(--text-primary)]">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-body text-[var(--text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
