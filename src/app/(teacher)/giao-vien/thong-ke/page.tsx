'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/header';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data
const overviewStats = [
  {
    label: 'Tổng học sinh',
    value: '150',
    change: '+12',
    trend: 'up' as const,
    icon: Users,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  {
    label: 'Bài tập đã giao',
    value: '37',
    change: '+5',
    trend: 'up' as const,
    icon: BookOpen,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    label: 'Tỷ lệ hoàn thành',
    value: '85%',
    change: '+3%',
    trend: 'up' as const,
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    label: 'Điểm trung bình',
    value: '7.8',
    change: '-0.2',
    trend: 'down' as const,
    icon: Award,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

const classPerformance = [
  { name: 'Lớp 8A', students: 50, avgScore: 7.8, completionRate: 85, trend: 'up' as const },
  { name: 'Lớp 8B', students: 48, avgScore: 7.2, completionRate: 78, trend: 'down' as const },
  { name: 'Lớp 9A', students: 52, avgScore: 8.1, completionRate: 92, trend: 'up' as const },
];

const recentAssignments = [
  { name: 'Kiểm tra Chương 5', class: 'Lớp 8A', submissions: 48, total: 50, avgScore: 7.5 },
  { name: 'Bài tập Hình học', class: 'Lớp 9A', submissions: 50, total: 52, avgScore: 8.2 },
  { name: 'Ôn tập Đại số', class: 'Lớp 8B', submissions: 40, total: 48, avgScore: 6.9 },
];

const topStudents = [
  { name: 'Nguyễn Văn A', class: 'Lớp 9A', avgScore: 9.5, assignments: 15 },
  { name: 'Trần Thị B', class: 'Lớp 8A', avgScore: 9.2, assignments: 12 },
  { name: 'Lê Văn C', class: 'Lớp 9A', avgScore: 9.0, assignments: 15 },
  { name: 'Phạm Thị D', class: 'Lớp 8B', avgScore: 8.8, assignments: 10 },
  { name: 'Hoàng Văn E', class: 'Lớp 8A', avgScore: 8.7, assignments: 12 },
];

const scoreDistribution = [
  { range: '9-10', count: 25, percentage: 17 },
  { range: '8-9', count: 40, percentage: 27 },
  { range: '7-8', count: 45, percentage: 30 },
  { range: '6-7', count: 25, percentage: 17 },
  { range: '< 6', count: 15, percentage: 10 },
];

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Thống kê"
        subtitle="Theo dõi tiến độ học tập và hiệu suất giảng dạy"
        action={
          <Button
            variant="secondary"
            rightIcon={<ChevronDown className="h-4 w-4" strokeWidth={1.75} />}
          >
            <Calendar className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Tháng này
          </Button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-start justify-between">
                <div className={cn('p-2 rounded-xl', stat.bgColor)}>
                  <Icon className={cn('h-5 w-5', stat.color)} strokeWidth={1.75} />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                )}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" strokeWidth={2} />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-tertiary)]">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Class Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
              Hiệu suất theo lớp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classPerformance.map((cls) => (
              <div key={cls.name} className="p-4 rounded-xl bg-[var(--bg-soft)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">{cls.name}</h4>
                    <p className="text-sm text-[var(--text-tertiary)]">{cls.students} học sinh</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[var(--text-primary)]">{cls.avgScore}</span>
                      {cls.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={1.75} />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-rose-500" strokeWidth={1.75} />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">Điểm TB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar value={cls.completionRate} size="sm" className="flex-1" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {cls.completionRate}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
              Phân bố điểm số
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreDistribution.map((item) => (
              <div key={item.range} className="flex items-center gap-3">
                <span className="w-12 text-sm font-medium text-[var(--text-secondary)]">
                  {item.range}
                </span>
                <div className="flex-1 h-8 bg-[var(--bg-soft)] rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-lg transition-all duration-500',
                      item.range === '9-10' ? 'bg-emerald-500' :
                      item.range === '8-9' ? 'bg-sky-500' :
                      item.range === '7-8' ? 'bg-violet-500' :
                      item.range === '6-7' ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-sm text-[var(--text-tertiary)] text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
              Bài tập gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAssignments.map((assignment, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)]"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--text-primary)] truncate">
                    {assignment.name}
                  </h4>
                  <p className="text-sm text-[var(--text-tertiary)]">{assignment.class}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {assignment.submissions}/{assignment.total}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">Đã nộp</p>
                  </div>
                  <Badge
                    variant={assignment.avgScore >= 8 ? 'success' : assignment.avgScore >= 6.5 ? 'warning' : 'error'}
                  >
                    {assignment.avgScore}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" strokeWidth={1.75} />
              Học sinh xuất sắc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents.map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-soft)]"
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    idx === 0 ? 'bg-amber-500 text-white' :
                    idx === 1 ? 'bg-mono-300 dark:bg-mono-600 text-mono-700 dark:text-mono-200' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-mono-200 dark:bg-mono-700 text-mono-600 dark:text-mono-300'
                  )}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--text-primary)] truncate">
                      {student.name}
                    </h4>
                    <p className="text-sm text-[var(--text-tertiary)]">{student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{student.avgScore}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{student.assignments} bài</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
