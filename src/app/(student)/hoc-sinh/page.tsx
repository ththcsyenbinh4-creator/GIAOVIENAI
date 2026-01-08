import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  TrendingUp,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing, ProgressBar } from '@/components/ui/progress';
import { PageHeader } from '@/components/layout/header';

// Mock data - sẽ được thay thế bằng data thực từ Supabase
const mockStats = {
  completedThisWeek: 3,
  totalThisWeek: 5,
  averageScore: 8.2,
  streak: 7,
};

const mockPendingAssignments = [
  {
    id: '1',
    title: 'Bài kiểm tra Chương 3: Hàm số',
    subject: 'Toán học',
    className: 'Lớp 8A',
    deadline: '2024-12-20T23:59:00',
    type: 'exam',
    duration: 45,
    questionCount: 20,
  },
  {
    id: '2',
    title: 'Bài tập về nhà: Phương trình',
    subject: 'Toán học',
    className: 'Lớp 8A',
    deadline: '2024-12-18T23:59:00',
    type: 'homework',
    duration: null,
    questionCount: 10,
  },
  {
    id: '3',
    title: 'Ôn tập từ vựng Unit 5',
    subject: 'Tiếng Anh',
    className: 'Lớp 8A',
    deadline: '2024-12-19T23:59:00',
    type: 'homework',
    duration: null,
    questionCount: 15,
  },
];

const mockRecentResults = [
  {
    id: '1',
    title: 'Bài kiểm tra Chương 2',
    subject: 'Toán học',
    score: 8.5,
    maxScore: 10,
    completedAt: '2024-12-14T10:30:00',
  },
  {
    id: '2',
    title: 'Bài tập Unit 4',
    subject: 'Tiếng Anh',
    score: 9,
    maxScore: 10,
    completedAt: '2024-12-13T15:45:00',
  },
  {
    id: '3',
    title: 'Kiểm tra giữa kỳ',
    subject: 'Vật lý',
    score: 7.5,
    maxScore: 10,
    completedAt: '2024-12-10T09:00:00',
  },
];

function getDeadlineStatus(deadline: string) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return { label: 'Quá hạn', variant: 'error' as const };
  if (diffHours < 24) return { label: 'Sắp hết hạn', variant: 'warning' as const };
  return { label: 'Còn hạn', variant: 'success' as const };
}

function formatDeadline(deadline: string) {
  const date = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays < 7) return `${diffDays} ngày nữa`;
  return date.toLocaleDateString('vi-VN');
}

export default function StudentDashboardPage() {
  const weekProgress = (mockStats.completedThisWeek / mockStats.totalThisWeek) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <PageHeader
        title="Xin chào, Minh!"
        subtitle="Tiếp tục học tập và chinh phục mục tiêu của bạn"
      />

      {/* Progress Card */}
      <Card className="mb-6 bg-gradient-to-r from-[var(--btn-primary-bg)] to-[var(--bg-soft)] text-[var(--btn-primary-text)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="opacity-80 text-sm mb-1">Tiến độ tuần này</p>
            <p className="text-3xl font-bold">
              {mockStats.completedThisWeek}/{mockStats.totalThisWeek}
            </p>
            <p className="opacity-80 text-sm mt-1">bài tập đã hoàn thành</p>
          </div>
          <ProgressRing
            value={weekProgress}
            size={100}
            strokeWidth={8}
            className="[&_circle:last-child]:stroke-[var(--btn-primary-text)]"
          >
            <div className="text-center">
              <span className="text-2xl font-bold">{Math.round(weekProgress)}%</span>
            </div>
          </ProgressRing>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center py-4">
          <Star className="h-6 w-6 mx-auto mb-2 text-warning" strokeWidth={1.75} />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{mockStats.averageScore}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Điểm TB</p>
        </Card>

        <Card className="text-center py-4">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" strokeWidth={1.75} />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{mockStats.streak}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Ngày liên tiếp</p>
        </Card>

        <Card className="text-center py-4">
          <BookOpen className="h-6 w-6 mx-auto mb-2 text-[var(--text-secondary)]" strokeWidth={1.75} />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{mockPendingAssignments.length}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Bài cần làm</p>
        </Card>
      </div>

      {/* Pending Assignments */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" strokeWidth={1.75} />
            Bài tập cần làm
          </CardTitle>
          <Link href="/hoc-sinh/bai-tap">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
              Xem tất cả
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPendingAssignments.map((assignment) => {
            const deadlineStatus = getDeadlineStatus(assignment.deadline);
            return (
              <Link
                key={assignment.id}
                href={`/hoc-sinh/bai-tap/${assignment.id}`}
                className="block p-4 -mx-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {assignment.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="default">{assignment.subject}</Badge>
                      <Badge variant={deadlineStatus.variant}>{deadlineStatus.label}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" strokeWidth={1.75} />
                      {formatDeadline(assignment.deadline)}
                    </span>
                    {assignment.duration && (
                      <span>{assignment.duration} phút</span>
                    )}
                    <span>{assignment.questionCount} câu</span>
                  </div>
                  <Button size="sm" variant="primary">
                    Làm bài
                  </Button>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
            Kết quả gần đây
          </CardTitle>
          <Link href="/hoc-sinh/ket-qua">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
              Xem tất cả
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRecentResults.map((result) => {
            const scorePercent = (result.score / result.maxScore) * 100;
            const scoreColor =
              scorePercent >= 80
                ? 'text-success'
                : scorePercent >= 60
                ? 'text-warning'
                : 'text-error';

            return (
              <Link
                key={result.id}
                href={`/hoc-sinh/ket-qua/${result.id}`}
                className="flex items-center gap-4 p-4 -mx-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">
                    {result.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default">{result.subject}</Badge>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {new Date(result.completedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${scoreColor}`}>
                    {result.score}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">/{result.maxScore} điểm</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
