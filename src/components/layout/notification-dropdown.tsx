'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  FileText,
  MessageSquare,
  AlertCircle,
  Clock,
  X,
  Check,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'teacher' | 'student';
  anchorRef: React.RefObject<HTMLButtonElement>;
}

interface Notification {
  id: string;
  type: 'assignment' | 'grade' | 'message' | 'system' | 'deadline';
  title: string;
  description: string;
  time: string;
  read: boolean;
  href?: string;
}

// Mock notifications
const mockNotifications: Record<string, Notification[]> = {
  teacher: [
    {
      id: '1',
      type: 'assignment',
      title: 'Bài nộp mới',
      description: 'Nguyễn Văn A đã nộp bài "Kiểm tra Chương 3"',
      time: '5 phút trước',
      read: false,
      href: '/giao-vien/cham-bai/1',
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Bài nộp mới',
      description: 'Trần Thị B đã nộp bài "Kiểm tra Chương 3"',
      time: '15 phút trước',
      read: false,
      href: '/giao-vien/cham-bai/2',
    },
    {
      id: '3',
      type: 'system',
      title: 'Nhắc nhở chấm bài',
      description: 'Có 12 bài đang chờ chấm điểm',
      time: '1 giờ trước',
      read: true,
      href: '/giao-vien/cham-bai',
    },
    {
      id: '4',
      type: 'message',
      title: 'Tin nhắn mới',
      description: 'Phụ huynh học sinh Lê Văn C đã gửi tin nhắn',
      time: '2 giờ trước',
      read: true,
    },
  ],
  student: [
    {
      id: '1',
      type: 'grade',
      title: 'Bài đã được chấm',
      description: 'Bạn đạt 8.5/10 điểm cho "Kiểm tra Chương 2"',
      time: '10 phút trước',
      read: false,
      href: '/hoc-sinh/ket-qua/1',
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Sắp hết hạn',
      description: '"Bài kiểm tra Chương 3" sẽ hết hạn trong 24 giờ',
      time: '1 giờ trước',
      read: false,
      href: '/hoc-sinh/bai-tap/1',
    },
    {
      id: '3',
      type: 'assignment',
      title: 'Bài tập mới',
      description: 'Cô Hạnh đã giao bài "Ôn tập cuối kỳ"',
      time: '3 giờ trước',
      read: true,
      href: '/hoc-sinh/bai-tap/3',
    },
    {
      id: '4',
      type: 'system',
      title: 'Chúc mừng!',
      description: 'Bạn đã học liên tiếp 7 ngày',
      time: '1 ngày trước',
      read: true,
    },
  ],
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'assignment':
      return FileText;
    case 'grade':
      return CheckCircle;
    case 'message':
      return MessageSquare;
    case 'deadline':
      return Clock;
    case 'system':
    default:
      return AlertCircle;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'assignment':
      return 'text-accent bg-accent/10';
    case 'grade':
      return 'text-success bg-success/10';
    case 'message':
      return 'text-[var(--text-secondary)] bg-[var(--bg-soft)]';
    case 'deadline':
      return 'text-warning bg-warning/10';
    case 'system':
    default:
      return 'text-[var(--text-secondary)] bg-[var(--bg-soft)]';
  }
};

export function NotificationDropdown({ isOpen, onClose, userRole, anchorRef }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications[userRole]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-strong animate-scale-in origin-top-right z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[var(--text-primary)]">Thông báo</h3>
          {unreadCount > 0 && (
            <Badge variant="primary" className="text-xs">
              {unreadCount} mới
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="icon-sm" onClick={markAllAsRead} title="Đánh dấu tất cả đã đọc">
              <Check className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
          <Link href={userRole === 'teacher' ? '/giao-vien/cai-dat' : '/hoc-sinh/cai-dat'}>
            <Button variant="ghost" size="icon-sm" title="Cài đặt thông báo">
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="p-2">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);

              const content = (
                <div
                  className={cn(
                    'flex gap-3 p-3 rounded-xl transition-colors group',
                    notification.read
                      ? 'hover:bg-[var(--bg-soft)]'
                      : 'bg-accent/5 hover:bg-accent/10'
                  )}
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        notification.read ? 'text-[var(--text-primary)]' : 'font-medium text-[var(--text-primary)]'
                      )}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-soft)] rounded"
                      >
                        <X className="h-3 w-3 text-[var(--text-tertiary)]" strokeWidth={2} />
                      </button>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                      {notification.description}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                  )}
                </div>
              );

              if (notification.href) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      markAsRead(notification.id);
                      onClose();
                    }}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={notification.id} onClick={() => markAsRead(notification.id)} className="cursor-pointer">
                  {content}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-[var(--text-tertiary)]" strokeWidth={1.5} />
            <p className="text-[var(--text-secondary)]">Không có thông báo</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-[var(--border-default)] p-2">
          <Link
            href={userRole === 'teacher' ? '/giao-vien/thong-bao' : '/hoc-sinh/thong-bao'}
            onClick={onClose}
            className="block w-full text-center py-2 text-sm font-medium text-accent hover:bg-[var(--bg-soft)] rounded-xl transition-colors"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}
