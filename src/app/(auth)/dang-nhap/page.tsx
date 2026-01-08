'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // PHASE 2: Implement Supabase auth signIn
      // For now, simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect based on role (demo: check email for role)
      if (formData.email.includes('teacher') || formData.email.includes('gv')) {
        router.push('/giao-vien');
      } else {
        router.push('/hoc-sinh');
      }
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng');
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Đăng nhập</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Chào mừng bạn quay trở lại Classroom AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          placeholder="Nhập mật khẩu"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          leftIcon={<Lock className="h-5 w-5" strokeWidth={1.75} />}
          required
        />

        {error && (
          <p className="text-sm text-error text-center">{error}</p>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-mono-300 dark:border-mono-600 text-mono-900 dark:text-mono-100 focus:ring-mono-400"
            />
            <span className="text-sm text-[var(--text-secondary)]">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/quen-mat-khau"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Đăng nhập
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Chưa có tài khoản?{' '}
        <Link href="/dang-ky" className="text-[var(--accent)] hover:underline font-medium">
          Đăng ký ngay
        </Link>
      </p>

      {/* Hint for demo mode */}
      {process.env.NEXT_PUBLIC_APP_ENV === 'prototype' && (
        <p className="mt-8 text-xs text-[var(--text-tertiary)] text-center">
          Chế độ prototype: Nhập email có chứa &quot;teacher&quot; hoặc &quot;gv&quot; để vào trang giáo viên
        </p>
      )}
    </div>
  );
}
