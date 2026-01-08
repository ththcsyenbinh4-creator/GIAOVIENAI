'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, BarChart, ArrowRight, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-mono-50 dark:bg-mono-950">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mono-900 dark:bg-mono-100">
              <Sparkles className="h-4 w-4 text-mono-50 dark:text-mono-900" strokeWidth={2} />
            </div>
            <span className="text-base font-semibold text-mono-900 dark:text-mono-50">
              Classroom AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-mono-600 dark:text-mono-400 hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {mounted && (
                theme === 'dark' ? (
                  <Moon className="h-5 w-5" strokeWidth={1.75} />
                ) : (
                  <Sun className="h-5 w-5" strokeWidth={1.75} />
                )
              )}
            </button>
            <Link href="/dang-nhap">
              <button className="px-4 py-2 text-sm font-medium text-mono-600 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-100 transition-colors">
                Đăng nhập
              </button>
            </Link>
            <Link href="/dang-ky">
              <button className="px-5 py-2 text-sm font-medium bg-mono-900 dark:bg-mono-100 text-mono-50 dark:text-mono-900 rounded-lg hover:bg-mono-800 dark:hover:bg-mono-200 transition-all duration-300 btn-glow">
                Bắt đầu ngay
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-10 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-glow bg-mono-100 dark:bg-mono-900 mb-8 animate-in-up opacity-0 stagger-1">
            <Zap className="h-4 w-4 text-mono-600 dark:text-mono-400" strokeWidth={2} />
            <span className="text-sm font-medium text-mono-700 dark:text-mono-300">
              Powered by AI
            </span>
          </div>

          <h1 className="text-4xl md:text-display font-bold text-mono-900 dark:text-mono-50 leading-tight tracking-tight animate-in-up opacity-0 stagger-2">
            Nền tảng học tập
            <br />
            <span className="text-gradient">thông minh</span> cho lớp học
          </h1>

          <p className="mt-6 text-lg text-mono-500 dark:text-mono-400 max-w-2xl mx-auto leading-relaxed animate-in-up opacity-0 stagger-3">
            Tạo bài tập, kiểm tra và đánh giá học sinh với sự hỗ trợ của AI.
            Tiết kiệm thời gian cho giáo viên, nâng cao hiệu quả học tập cho học sinh.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in-up opacity-0 stagger-4">
            <Link href="/dang-ky">
              <button className="group flex items-center gap-2 px-8 py-4 text-base font-medium bg-mono-900 dark:bg-mono-50 text-mono-50 dark:text-mono-900 rounded-xl hover:bg-mono-800 dark:hover:bg-mono-100 transition-all duration-300 shadow-medium hover:shadow-strong btn-glow">
                Bắt đầu miễn phí
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
            </Link>
            <Link href="/gioi-thieu">
              <button className="px-8 py-4 text-base font-medium text-mono-600 dark:text-mono-400 border border-mono-200 dark:border-mono-800 rounded-xl hover:border-mono-400 dark:hover:border-mono-600 hover:text-mono-900 dark:hover:text-mono-100 transition-all duration-300">
                Tìm hiểu thêm
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-title-lg font-bold text-mono-900 dark:text-mono-50 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-mono-500 dark:text-mono-400 max-w-xl mx-auto">
              Giải pháp toàn diện giúp giáo viên tiết kiệm thời gian và nâng cao chất lượng giảng dạy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="group card-premium rounded-2xl p-8 bg-mono-100/50 dark:bg-mono-900/50">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-mono-200/80 dark:bg-mono-800/80 group-hover:bg-mono-300/80 dark:group-hover:bg-mono-700/80 transition-colors duration-300">
                <Sparkles className="h-6 w-6 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-50 mb-3">
                AI Tạo đề tự động
              </h3>
              <p className="text-mono-500 dark:text-mono-400 leading-relaxed">
                Upload tài liệu, AI sẽ tự động tạo câu hỏi trắc nghiệm và tự luận
                phù hợp với nội dung bài học.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group card-premium rounded-2xl p-8 bg-mono-100/50 dark:bg-mono-900/50">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-mono-200/80 dark:bg-mono-800/80 group-hover:bg-mono-300/80 dark:group-hover:bg-mono-700/80 transition-colors duration-300">
                <BookOpen className="h-6 w-6 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-50 mb-3">
                Chấm bài thông minh
              </h3>
              <p className="text-mono-500 dark:text-mono-400 leading-relaxed">
                Tự động chấm trắc nghiệm, AI gợi ý điểm cho tự luận.
                Giáo viên duyệt một lần, tiết kiệm 80% thời gian.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group card-premium rounded-2xl p-8 bg-mono-100/50 dark:bg-mono-900/50">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-mono-200/80 dark:bg-mono-800/80 group-hover:bg-mono-300/80 dark:group-hover:bg-mono-700/80 transition-colors duration-300">
                <BarChart className="h-6 w-6 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-50 mb-3">
                Phân tích kết quả
              </h3>
              <p className="text-mono-500 dark:text-mono-400 leading-relaxed">
                Báo cáo chi tiết điểm mạnh, điểm yếu của từng học sinh.
                Gợi ý ôn tập cá nhân hóa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl bg-mono-900 dark:bg-mono-100 p-12 md:p-16 text-center overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-mono-600/20 dark:bg-mono-400/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-mono-50 dark:text-mono-900 mb-4">
                Sẵn sàng nâng cấp lớp học của bạn?
              </h2>
              <p className="text-mono-400 dark:text-mono-600 mb-10 max-w-lg mx-auto">
                Đăng ký ngay hôm nay và trải nghiệm sức mạnh của AI trong giáo dục
              </p>
              <Link href="/dang-ky">
                <button className="px-10 py-4 text-base font-medium bg-mono-50 dark:bg-mono-900 text-mono-900 dark:text-mono-50 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800 transition-all duration-300 shadow-soft">
                  Đăng ký miễn phí
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-mono-200 dark:border-mono-800">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-mono-400" strokeWidth={2} />
            <span className="font-medium text-mono-900 dark:text-mono-100">Classroom AI</span>
          </div>
          <p className="text-sm text-mono-500 dark:text-mono-500">
            © 2024 Classroom AI. Được phát triển với sự hỗ trợ của AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
