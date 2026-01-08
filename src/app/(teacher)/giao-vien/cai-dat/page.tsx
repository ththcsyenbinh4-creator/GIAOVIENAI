'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Phone,
  Camera,
  Check,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/header';
import { cn } from '@/lib/utils';

// Mock user data
const mockUser = {
  name: 'Cô Hạnh',
  email: 'hanh.nguyen@school.edu.vn',
  phone: '0912 345 678',
  avatar: null,
  role: 'teacher',
  school: 'THCS Nguyễn Du',
  subject: 'Toán học',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Profile state
  const [profile, setProfile] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    school: mockUser.school,
    subject: mockUser.subject,
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewSubmission: true,
    emailGradeReminder: true,
    emailWeeklyReport: false,
    pushNewSubmission: true,
    pushMessages: true,
    pushAnnouncements: false,
  });

  // Language settings
  const [language, setLanguage] = useState('vi');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Cài đặt"
        subtitle="Quản lý tài khoản và tùy chỉnh ứng dụng"
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-56 flex-shrink-0">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-2">
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'profile'
                    ? 'bg-[var(--bg-soft)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]'
                )}
              >
                <User className="h-5 w-5" strokeWidth={1.75} />
                Hồ sơ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'notifications'
                    ? 'bg-[var(--bg-soft)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]'
                )}
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                Thông báo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'security'
                    ? 'bg-[var(--bg-soft)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]'
                )}
              >
                <Shield className="h-5 w-5" strokeWidth={1.75} />
                Bảo mật
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'appearance'
                    ? 'bg-[var(--bg-soft)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]'
                )}
              >
                <Palette className="h-5 w-5" strokeWidth={1.75} />
                Giao diện
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-[var(--bg-soft)] flex items-center justify-center text-2xl font-bold text-[var(--text-secondary)]">
                      {profile.name.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[var(--text-primary)] text-[var(--bg-surface)] flex items-center justify-center hover:opacity-80 transition-opacity">
                      <Camera className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{profile.name}</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">Giáo viên {profile.subject}</p>
                    <Badge variant="primary" className="mt-1">Đã xác thực</Badge>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4">
                  <Input
                    label="Họ và tên"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    leftIcon={<User className="h-5 w-5" strokeWidth={1.75} />}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    leftIcon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
                  />
                  <Input
                    label="Số điện thoại"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    leftIcon={<Phone className="h-5 w-5" strokeWidth={1.75} />}
                  />
                  <Input
                    label="Trường"
                    value={profile.school}
                    onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  />
                  <Input
                    label="Môn giảng dạy"
                    value={profile.subject}
                    onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} isLoading={isSaving}>
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                    Thông báo qua Email
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNewSubmission', label: 'Bài nộp mới', desc: 'Nhận email khi học sinh nộp bài' },
                      { key: 'emailGradeReminder', label: 'Nhắc nhở chấm bài', desc: 'Nhắc nhở khi có bài chưa chấm' },
                      { key: 'emailWeeklyReport', label: 'Báo cáo tuần', desc: 'Tổng kết hoạt động hàng tuần' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-soft)] cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                          <p className="text-sm text-[var(--text-tertiary)]">{item.desc}</p>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--border-strong)] rounded-full peer peer-checked:bg-success transition-colors" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                    Thông báo đẩy
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'pushNewSubmission', label: 'Bài nộp mới', desc: 'Thông báo khi học sinh nộp bài' },
                      { key: 'pushMessages', label: 'Tin nhắn', desc: 'Thông báo tin nhắn mới' },
                      { key: 'pushAnnouncements', label: 'Thông báo hệ thống', desc: 'Cập nhật và thông báo quan trọng' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-soft)] cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                          <p className="text-sm text-[var(--text-tertiary)]">{item.desc}</p>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--border-strong)] rounded-full peer peer-checked:bg-success transition-colors" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--text-primary)]">Mật khẩu</h4>
                      <p className="text-sm text-[var(--text-tertiary)]">Cập nhật lần cuối: 30 ngày trước</p>
                    </div>
                    <Button variant="secondary" size="sm">Đổi mật khẩu</Button>
                  </div>
                </div>

                {/* Two Factor */}
                <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--text-primary)]">Xác thực 2 bước</h4>
                      <p className="text-sm text-[var(--text-tertiary)]">Bảo vệ tài khoản với xác thực 2 bước</p>
                    </div>
                    <Badge variant="warning">Chưa bật</Badge>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-3">
                    Thiết lập
                  </Button>
                </div>

                {/* Login Sessions */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-4">Phiên đăng nhập</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-soft)]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Monitor className="h-5 w-5 text-success" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">MacBook Pro - Chrome</p>
                          <p className="text-sm text-[var(--text-tertiary)]">Hà Nội, Việt Nam • Đang hoạt động</p>
                        </div>
                      </div>
                      <Badge variant="success">Hiện tại</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-soft)]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--bg-soft)] flex items-center justify-center">
                          <Phone className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">iPhone 14 - Safari</p>
                          <p className="text-sm text-[var(--text-tertiary)]">Hà Nội, Việt Nam • 2 giờ trước</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-error hover:text-error">
                        Đăng xuất
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-[var(--border-default)] pt-6">
                  <h4 className="font-medium text-error mb-4">Vùng nguy hiểm</h4>
                  <div className="p-4 rounded-xl border border-error/20 bg-error/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Xóa tài khoản</p>
                        <p className="text-sm text-[var(--text-tertiary)]">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
                      </div>
                      <Button variant="destructive" size="sm">Xóa tài khoản</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Tùy chỉnh giao diện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-4">Chế độ hiển thị</h4>
                  {mounted && (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
                          theme === 'light'
                            ? 'border-[var(--text-primary)] bg-[var(--bg-soft)]'
                            : 'border-transparent bg-[var(--bg-soft)] hover:border-[var(--border-hover)]'
                        )}
                      >
                        <Sun className="h-6 w-6 text-[var(--text-secondary)]" strokeWidth={1.75} />
                        <span className="text-sm font-medium text-[var(--text-primary)]">Sáng</span>
                        {theme === 'light' && (
                          <Check className="h-4 w-4 text-success" strokeWidth={2} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
                          theme === 'dark'
                            ? 'border-[var(--text-primary)] bg-[var(--bg-soft)]'
                            : 'border-transparent bg-[var(--bg-soft)] hover:border-[var(--border-hover)]'
                        )}
                      >
                        <Moon className="h-6 w-6 text-[var(--text-secondary)]" strokeWidth={1.75} />
                        <span className="text-sm font-medium text-[var(--text-primary)]">Tối</span>
                        {theme === 'dark' && (
                          <Check className="h-4 w-4 text-success" strokeWidth={2} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
                          theme === 'system'
                            ? 'border-[var(--text-primary)] bg-[var(--bg-soft)]'
                            : 'border-transparent bg-[var(--bg-soft)] hover:border-[var(--border-hover)]'
                        )}
                      >
                        <Monitor className="h-6 w-6 text-[var(--text-secondary)]" strokeWidth={1.75} />
                        <span className="text-sm font-medium text-[var(--text-primary)]">Hệ thống</span>
                        {theme === 'system' && (
                          <Check className="h-4 w-4 text-success" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-[var(--text-tertiary)] mt-3">
                    Chế độ "Hệ thống" sẽ tự động thay đổi theo cài đặt thiết bị của bạn.
                  </p>
                </div>

                {/* Language */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                    Ngôn ngữ
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage('vi')}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border-2 transition-colors',
                        language === 'vi'
                          ? 'border-[var(--text-primary)] bg-mono-100 dark:bg-mono-800'
                          : 'border-transparent bg-[var(--bg-soft)] hover:border-[var(--border-hover)]'
                      )}
                    >
                      <span className="font-medium text-[var(--text-primary)]">Tiếng Việt</span>
                      {language === 'vi' && (
                        <Check className="h-4 w-4 text-success" strokeWidth={2} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border-2 transition-colors',
                        language === 'en'
                          ? 'border-[var(--text-primary)] bg-mono-100 dark:bg-mono-800'
                          : 'border-transparent bg-[var(--bg-soft)] hover:border-[var(--border-hover)]'
                      )}
                    >
                      <span className="font-medium text-[var(--text-primary)]">English</span>
                      {language === 'en' && (
                        <Check className="h-4 w-4 text-success" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
