'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Search, Menu, Sun, Moon, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SearchModal } from './search-modal';
import { NotificationDropdown } from './notification-dropdown';
import { useFloatingActions } from './floating-actions-context';
import { cn } from '@/lib/utils';

export interface FloatingActionsProps {
  userRole: 'teacher' | 'student';
  onMenuClick?: () => void;
}

export function FloatingActions({ userRole, onMenuClick }: FloatingActionsProps) {
  const { actionButton } = useFloatingActions();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const glassBarRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Handle click outside to close on mobile
  const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
    if (glassBarRef.current && !glassBarRef.current.contains(e.target as Node)) {
      if (isExpanded && !isNotificationOpen) {
        setIsExpanded(false);
      }
    }
  }, [isExpanded, isNotificationOpen]);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded, handleClickOutside]);

  // Mock unread count - replace with real data later
  const unreadCount = userRole === 'teacher' ? 2 : 2;

  const isDark = resolvedTheme === 'dark';

  // Close expanded bar
  const handleClose = () => {
    setIsExpanded(false);
    setIsNotificationOpen(false);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <>
        {/* Mobile Menu Button - Left side */}
        {onMenuClick && (
          <div className="fixed top-4 left-4 z-50 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-10 w-10 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--border-default)] shadow-sm"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Mobile Menu Button - Left side */}
      {onMenuClick && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-10 w-10 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--border-default)] shadow-sm"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </div>
      )}

      {/* Floating Actions - Right side */}
      <div className="fixed top-4 right-0 md:top-6 z-50 flex items-center gap-2">
        {/* Action Button (e.g., "Tạo bài tập") - renders on the left */}
        {actionButton && (
          <div className="hidden md:block mr-2">
            {actionButton}
          </div>
        )}

        {/* Glass Bar - Collapsed/Expanded - 3D Glass Effect */}
        <div
          ref={glassBarRef}
          className={cn(
            'flex items-center transition-all duration-300 ease-out overflow-hidden',
            // 3D Glass effect - trong suốt với chiều sâu
            isDark
              ? 'bg-white/20 border-white/30'
              : 'bg-black/20 border-black/30',
            'backdrop-blur-2xl border',
            // Shadow cho hiệu ứng 3D
            isDark
              ? 'shadow-[0_8px_32px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]'
              : 'shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
            // Collapsed: thanh hình chữ nhật, kích thước tăng 160%
            // w-3 (12px) -> giữ nguyên chiều rộng 12px
            // h-7 (28px) -> h-11 (44px) tăng 160%
            !isExpanded && 'w-3 h-11 rounded-md cursor-pointer hover:w-4 hover:bg-opacity-30',
            // Expanded: mở rộng sang trái theo trục X, hình chữ nhật
            isExpanded && 'rounded-l-lg px-2 py-2 gap-2'
          )}
          onClick={() => !isExpanded && setIsExpanded(true)}
          onMouseLeave={() => {
            // Desktop: đóng khi mouse leave
            if (window.innerWidth >= 768 && isExpanded && !isNotificationOpen) {
              setIsExpanded(false);
            }
          }}
        >
          {/* Collapsed indicator - 3 dots dọc */}
          {!isExpanded && (
            <div className="flex flex-col gap-1 items-center justify-center w-full h-full">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                isDark ? 'bg-white/70' : 'bg-black/70'
              )} />
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                isDark ? 'bg-white/70' : 'bg-black/70'
              )} />
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                isDark ? 'bg-white/70' : 'bg-black/70'
              )} />
            </div>
          )}

          {/* Expanded: Show icons - kích thước tăng 160% */}
          {isExpanded && (
            <>
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  'h-9 w-9 rounded-lg',
                  isDark
                    ? 'text-white hover:bg-white/20'
                    : 'text-black hover:bg-black/20'
                )}
                title="Tìm kiếm (⌘K)"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </Button>

              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={cn(
                  'h-9 w-9 rounded-lg',
                  isDark
                    ? 'text-white hover:bg-white/20'
                    : 'text-black hover:bg-black/20'
                )}
                title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                {isDark ? (
                  <Sun className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Moon className="h-5 w-5" strokeWidth={2} />
                )}
              </Button>

              {/* Notification Button */}
              <div className="relative">
                <Button
                  ref={notificationButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={cn(
                    'h-9 w-9 rounded-lg relative',
                    isDark
                      ? 'text-white hover:bg-white/20'
                      : 'text-black hover:bg-black/20'
                  )}
                  title="Thông báo"
                >
                  <Bell className="h-5 w-5" strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </Button>
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  userRole={userRole}
                  anchorRef={notificationButtonRef}
                />
              </div>

              {/* Close Button - Hiển thị trên mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className={cn(
                  'h-9 w-9 rounded-lg md:hidden',
                  isDark
                    ? 'text-white hover:bg-white/20'
                    : 'text-black hover:bg-black/20'
                )}
                title="Đóng"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
