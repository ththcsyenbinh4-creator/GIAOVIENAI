'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type UserRole = 'teacher' | 'student';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      // PHASE 2: Implement Supabase auth signUp with role metadata
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to appropriate dashboard
      if (role === 'teacher') {
        router.push('/giao-vien');
      } else {
        router.push('/hoc-sinh');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Logo for mobile */}
      <div className="mb-8 flex justify-center lg:hidden">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-mono-900 dark:bg-mono-100">
          <Sparkles className="h-7 w-7 text-mono-50 dark:text-mono-900" strokeWidth={1.75} />
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Đăng ký tài khoản</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {step === 1
            ? 'Bạn là giáo viên hay học sinh?'
            : 'Điền thông tin để tạo tài khoản'}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('teacher')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-[var(--border-default)] hover:border-mono-400 dark:hover:border-mono-500 hover:bg-mono-100 dark:hover:bg-mono-800 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mono-200 dark:bg-mono-800">
              <User className="h-6 w-6 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[var(--text-primary)]">Tôi là Giáo viên</p>
              <p className="text-sm text-[var(--text-secondary)]">Tạo lớp, giao bài, chấm điểm</p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('student')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-[var(--border-default)] hover:border-mono-400 dark:hover:border-mono-500 hover:bg-mono-100 dark:hover:bg-mono-800 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <User className="h-6 w-6 text-success" strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[var(--text-primary)]">Tôi là Học sinh</p>
              <p className="text-sm text-[var(--text-secondary)]">Làm bài tập, xem điểm, ôn tập</p>
            </div>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            leftIcon={<User className="h-5 w-5" strokeWidth={1.75} />}
            required
          />

          <Input
            type="email"
            label="Email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
            required
          />

          <Input
            type="password"
            label="Mật khẩu"
            placeholder="Ít nhất 6 ký tự"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            leftIcon={<Lock className="h-5 w-5" strokeWidth={1.75} />}
            required
          />

          <Input
            type="password"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            leftIcon={<Lock className="h-5 w-5" strokeWidth={1.75} />}
            required
          />

          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Quay lại
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              Đăng ký
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Đã có tài khoản?{' '}
        <Link href="/dang-nhap" className="text-[var(--accent)] hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
