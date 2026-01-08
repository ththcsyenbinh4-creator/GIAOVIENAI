'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  PenLine,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
  BookOpen,
  Play,
  Timer,
  Target,
  Presentation,
  Brain,
  Lightbulb,
  Award,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress';
import { PageHeader } from '@/components/layout/header';
import { useFloatingActions } from '@/components/layout/floating-actions-context';

// Mock data - sẽ được thay thế bằng data thực từ Supabase
const mockStats = {
  totalClasses: 3,
  totalStudents: 150,
  pendingAssignments: 7,
  pendingGrading: 12,
};

const mockRecentAssignments = [
  {
    id: '1',
    title: 'Bài kiểm tra Chương 3: Hàm số',
    className: 'Lớp 8A',
    deadline: '2024-12-20T23:59:00',
    submissionCount: 45,
    totalStudents: 50,
    status: 'active',
  },
  {
    id: '2',
    title: 'Bài tập về nhà: Phương trình',
    className: 'Lớp 8B',
    deadline: '2024-12-18T23:59:00',
    submissionCount: 38,
    totalStudents: 48,
    status: 'active',
  },
  {
    id: '3',
    title: 'Ôn tập cuối kỳ',
    className: 'Lớp 9A',
    deadline: '2024-12-22T23:59:00',
    submissionCount: 50,
    totalStudents: 52,
    status: 'active',
  },
];

const mockPendingGrading = [
  {
    id: '1',
    studentName: 'Nguyễn Văn A',
    assignmentTitle: 'Bài kiểm tra Chương 3',
    className: 'Lớp 8A',
    submittedAt: '2024-12-15T14:30:00',
    hasEssay: true,
  },
  {
    id: '2',
    studentName: 'Trần Thị B',
    assignmentTitle: 'Bài kiểm tra Chương 3',
    className: 'Lớp 8A',
    submittedAt: '2024-12-15T15:20:00',
    hasEssay: true,
  },
  {
    id: '3',
    studentName: 'Lê Văn C',
    assignmentTitle: 'Bài tập về nhà',
    className: 'Lớp 8B',
    submittedAt: '2024-12-15T16:45:00',
    hasEssay: false,
  },
];

// Mock lesson teaching statistics
const mockLessonStats = {
  totalLessons: 12,
  lessonsThisWeek: 3,
  totalTeachingMinutes: 540, // 9 hours
  averageTimeEfficiency: 94, // 94% on time
  materialsCreated: {
    slides: 48,
    flashcards: 156,
    worksheets: 24,
  },
  recentLessons: [
    {
      id: '1',
      title: 'Phân số - Cộng trừ phân số',
      subject: 'Toán',
      gradeLevel: 'Lớp 4',
      duration: 45,
      actualDuration: 47,
      status: 'completed',
      completedAt: '2024-12-15T10:00:00',
    },
    {
      id: '2',
      title: 'Truyện Kiều - Giới thiệu',
      subject: 'Ngữ văn',
      gradeLevel: 'Lớp 10',
      duration: 45,
      actualDuration: 43,
      status: 'completed',
      completedAt: '2024-12-14T14:00:00',
    },
    {
      id: '3',
      title: 'Cách mạng tháng Tám',
      subject: 'Lịch sử',
      gradeLevel: 'Lớp 9',
      duration: 45,
      actualDuration: 48,
      status: 'ready',
      completedAt: null,
    },
  ],
  insights: [
    { type: 'success', message: '3 bài giảng tuần này đều đúng giờ' },
    { type: 'tip', message: 'Phần "Thảo luận" thường vượt 2 phút, có thể rút ngắn' },
  ],
};

export default function TeacherDashboardPage() {
  const { setActionButton } = useFloatingActions();

  // Set floating action button for this page
  useEffect(() => {
    setActionButton(
      <Link href="/giao-vien/bai-tap/tao-moi">
        <Button leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}>
          Tạo bài tập
        </Button>
      </Link>
    );

    // Clear when leaving page
    return () => setActionButton(null);
  }, [setActionButton]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <PageHeader
        title="Chào cô Hạnh"
        subtitle="Chúc cô có một ngày làm việc hiệu quả"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/giao-vien/lop-hoc">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-soft)]">
                <Users className="h-6 w-6 text-[var(--text-secondary)]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {mockStats.totalClasses}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Lớp học</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {mockStats.totalStudents}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">Học sinh</p>
            </div>
          </div>
        </Card>

        <Link href="/giao-vien/bai-tap">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <CheckCircle className="h-6 w-6 text-warning" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {mockStats.pendingAssignments}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Bài đang mở</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/giao-vien/cham-bai">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
                <PenLine className="h-6 w-6 text-error" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {mockStats.pendingGrading}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Chờ chấm</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Lesson Teaching Statistics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Bài giảng 45 phút</h2>
              <p className="text-sm text-[var(--text-tertiary)]">Tuần này: {mockLessonStats.lessonsThisWeek} bài</p>
            </div>
          </div>
          <Link href="/giao-vien/bai-giang">
            <Button variant="primary" leftIcon={<Play className="h-4 w-4" strokeWidth={1.75} />}>
              Tạo bài giảng
            </Button>
          </Link>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-mono-900">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-indigo-500" strokeWidth={1.75} />
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{Math.floor(mockLessonStats.totalTeachingMinutes / 60)}h</p>
                <p className="text-xs text-[var(--text-tertiary)]">Tổng thời gian dạy</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-mono-900">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-500" strokeWidth={1.75} />
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{mockLessonStats.averageTimeEfficiency}%</p>
                <p className="text-xs text-[var(--text-tertiary)]">Đúng giờ</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-mono-900">
            <div className="flex items-center gap-3">
              <Presentation className="h-5 w-5 text-purple-500" strokeWidth={1.75} />
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{mockLessonStats.materialsCreated.slides}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Slide tạo bởi AI</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-mono-900">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-orange-500" strokeWidth={1.75} />
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{mockLessonStats.materialsCreated.flashcards}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Flashcard</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Lessons & Insights */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent Lessons */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Bài giảng gần đây</CardTitle>
                <Link href="/giao-vien/bai-giang">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
                    Xem tất cả
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockLessonStats.recentLessons.map((lesson) => {
                  const timeDiff = lesson.actualDuration - lesson.duration;
                  const isOvertime = timeDiff > 0;
                  return (
                    <Link
                      key={lesson.id}
                      href="/giao-vien/bai-giang"
                      className="flex items-center gap-4 p-3 -mx-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                          <span>{lesson.subject}</span>
                          <span>•</span>
                          <span>{lesson.gradeLevel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {lesson.status === 'completed' ? (
                          <>
                            <div className={`text-sm font-medium ${isOvertime ? 'text-amber-500' : 'text-green-500'}`}>
                              {isOvertime ? `+${timeDiff}` : timeDiff} phút
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)]">
                              {lesson.completedAt && new Date(lesson.completedAt).toLocaleDateString('vi-VN')}
                            </div>
                          </>
                        ) : (
                          <Badge variant="default">Sẵn sàng</Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-mono-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" strokeWidth={1.75} />
                Gợi ý từ AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockLessonStats.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl ${
                    insight.type === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {insight.type === 'success' ? (
                      <Award className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                    ) : (
                      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                    )}
                    <p className={`text-sm ${
                      insight.type === 'success'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bài tập gần đây</CardTitle>
            <Link href="/giao-vien/bai-tap">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentAssignments.map((assignment) => {
              const progress = (assignment.submissionCount / assignment.totalStudents) * 100;
              return (
                <Link
                  key={assignment.id}
                  href={`/giao-vien/bai-tap/${assignment.id}`}
                  className="flex items-center gap-4 p-4 -mx-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors"
                >
                  <ProgressRing value={progress} size={48} strokeWidth={4}>
                    <span className="text-xs font-medium">{Math.round(progress)}%</span>
                  </ProgressRing>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {assignment.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default">{assignment.className}</Badge>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.75} />
                        {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {assignment.submissionCount}/{assignment.totalStudents}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">đã nộp</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Pending Grading */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bài chờ chấm điểm</CardTitle>
            <Link href="/giao-vien/cham-bai">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockPendingGrading.map((submission) => (
              <Link
                key={submission.id}
                href={`/giao-vien/cham-bai/${submission.id}`}
                className="flex items-center gap-4 p-4 -mx-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[var(--text-secondary)] font-medium">
                  {submission.studentName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">
                    {submission.studentName}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {submission.assignmentTitle}
                  </p>
                </div>
                <div className="text-right">
                  {submission.hasEssay && (
                    <Badge variant="warning">Có tự luận</Badge>
                  )}
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {new Date(submission.submittedAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Demo Helper Card */}
      <div className="mt-8 mb-6">
        <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-mono-800 shadow-sm">
                <Sparkles className="h-6 w-6 text-indigo-500" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Muốn demo cho đồng nghiệp?
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Xem kịch bản Demo 30 phút chuẩn bị sẵn
                </p>
              </div>
            </div>
            <Link href="/demo/script">
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
              >
                Mở Demo Script
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/giao-vien/bai-giang">
            <Card hover className="text-center py-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-mono-900">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-indigo-500" strokeWidth={1.75} />
              <p className="font-medium text-[var(--text-primary)]">Bài giảng 45p</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Slide + Flashcard + Bài tập</p>
            </Card>
          </Link>

          <Link href="/giao-vien/tai-lieu/upload">
            <Card hover className="text-center py-6">
              <FileText className="h-8 w-8 mx-auto mb-3 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <p className="font-medium text-[var(--text-primary)]">Upload tài liệu</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Tạo câu hỏi bằng AI</p>
            </Card>
          </Link>

          <Link href="/giao-vien/bai-tap/tao-moi">
            <Card hover className="text-center py-6">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-success" strokeWidth={1.75} />
              <p className="font-medium text-[var(--text-primary)]">Tạo bài tập</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Bài tập & kiểm tra</p>
            </Card>
          </Link>

          <Link href="/giao-vien/lop-hoc/tao-moi">
            <Card hover className="text-center py-6">
              <Users className="h-8 w-8 mx-auto mb-3 text-warning" strokeWidth={1.75} />
              <p className="font-medium text-[var(--text-primary)]">Tạo lớp học</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Thêm lớp mới</p>
            </Card>
          </Link>

          <Link href="/giao-vien/cham-bai">
            <Card hover className="text-center py-6">
              <PenLine className="h-8 w-8 mx-auto mb-3 text-error" strokeWidth={1.75} />
              <p className="font-medium text-[var(--text-primary)]">Chấm bài</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{mockStats.pendingGrading} bài chờ</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
