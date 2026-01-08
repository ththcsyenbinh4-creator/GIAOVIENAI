'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)] relative">
      {/* Theme Toggle - Top Right */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--border-default)] shadow-sm hover:bg-[var(--bg-soft)] transition-colors"
        title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
      >
        {mounted && (
          theme === 'dark' ? (
            <Moon className="h-5 w-5 text-[var(--text-primary)]" strokeWidth={1.75} />
          ) : (
            <Sun className="h-5 w-5 text-[var(--text-primary)]" strokeWidth={1.75} />
          )
        )}
      </button>

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-mono-100 dark:bg-mono-950 p-12 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-mono-50 via-mono-100 to-mono-200 dark:from-mono-900 dark:via-mono-950 dark:to-black" />

        {/* Subtle animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-mono-900/5 dark:bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-mono-900/5 dark:bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="text-center max-w-md relative z-10">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-mono-900/10 dark:bg-white/10 logo-float logo-pulse">
              <Sparkles className="h-12 w-12 text-mono-900 dark:text-white sparkle-animate" strokeWidth={1.5} />
            </div>
          </div>

          {/* Shimmering Title */}
          <h1 className="text-4xl font-bold mb-4 text-mono-900 dark:text-white">
            Classroom AI
          </h1>

          {/* Animated Subtitle */}
          <p className="text-mono-600 dark:text-white/80 text-lg fade-in-up">
            Nền tảng giao bài tập & kiểm tra thông minh cho giáo viên và học sinh
          </p>
        </div>
      </div>
    </div>
  );
}
