'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Users,
  BookOpen,
  BarChart,
  FileText,
  Search,
  Plus,
  UserPlus,
  MoreVertical,
  Mail,
  Trash2,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Share2,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar, ProgressRing } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data
const mockClass = {
  id: 'class-1',
  name: 'Lớp 8A',
  description: 'Toán học - Năm học 2024-2025',
  inviteCode: 'ABC12345',
  studentCount: 50,
  createdAt: '2024-09-01',
};

const mockStudents = [
  {
    id: 'student-1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@school.edu.vn',
    studentCode: 'HS001',
    joinedAt: '2024-09-01',
    stats: {
      completedAssignments: 10,
      totalAssignments: 12,
      averageScore: 8.5,
      trend: 'up' as const,
    },
  },
  {
    id: 'student-2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@school.edu.vn',
    studentCode: 'HS002',
    joinedAt: '2024-09-01',
    stats: {
      completedAssignments: 11,
      totalAssignments: 12,
      averageScore: 9.0,
      trend: 'up' as const,
    },
  },
  {
    id: 'student-3',
    name: 'Lê Văn Cường',
    email: 'cuong.le@school.edu.vn',
    studentCode: 'HS003',
    joinedAt: '2024-09-02',
    stats: {
      completedAssignments: 8,
      totalAssignments: 12,
      averageScore: 6.5,
      trend: 'down' as const,
    },
  },
  {
    id: 'student-4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@school.edu.vn',
    studentCode: 'HS004',
    joinedAt: '2024-09-02',
    stats: {
      completedAssignments: 12,
      totalAssignments: 12,
      averageScore: 7.8,
      trend: 'up' as const,
    },
  },
  {
    id: 'student-5',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@school.edu.vn',
    studentCode: 'HS005',
    joinedAt: '2024-09-03',
    stats: {
      completedAssignments: 9,
      totalAssignments: 12,
      averageScore: 7.2,
      trend: 'up' as const,
    },
  },
];

const mockAssignments = [
  {
    id: 'assign-1',
    title: 'Bài kiểm tra Chương 3: Hàm số',
    type: 'exam',
    deadline: '2024-12-20T23:59:00',
    submissionCount: 45,
    totalStudents: 50,
    averageScore: 7.8,
  },
  {
    id: 'assign-2',
    title: 'Bài tập về nhà: Phương trình',
    type: 'homework',
    deadline: '2024-12-18T23:59:00',
    submissionCount: 50,
    totalStudents: 50,
    averageScore: 8.2,
  },
  {
    id: 'assign-3',
    title: 'Kiểm tra 15 phút - Hình học',
    type: 'quiz',
    deadline: '2024-12-15T23:59:00',
    submissionCount: 48,
    totalStudents: 50,
    averageScore: 7.5,
  },
];

const mockClassStats = {
  averageScore: 7.8,
  completionRate: 85,
  topPerformers: 12,
  needsAttention: 5,
  weakTopics: ['Hàm số bậc hai', 'Đồ thị hàm số'],
};

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);

  // Filter students
  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Student status filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'late'>('all');

  const getStudentStatus = (student: typeof mockStudents[0]) => {
    const rate = student.stats.completedAssignments / student.stats.totalAssignments;
    if (rate === 1) return 'completed';
    if (rate >= 0.7) return 'pending';
    return 'late';
  };

  const filteredByStatus = filteredStudents.filter((student) => {
    if (statusFilter === 'all') return true;
    return getStudentStatus(student) === statusFilter;
  });

  const handleRemoveStudent = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setShowRemoveModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/giao-vien/lop-hoc">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{mockClass.name}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{mockClass.description}</p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Share2 className="h-5 w-5" strokeWidth={1.75} />}
        >
          Mời học sinh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="h-5 w-5 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{mockClass.studentCount}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Học sinh</p>
        </Card>

        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BarChart className="h-5 w-5 text-success" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{mockClassStats.averageScore}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Điểm TB</p>
        </Card>

        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{mockClassStats.completionRate}%</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Hoàn thành</p>
        </Card>

        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="h-5 w-5 text-warning" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{mockClassStats.needsAttention}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Cần chú ý</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Học sinh ({mockStudents.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BookOpen className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Bài tập ({mockAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Thống kê
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Tìm theo tên hoặc mã học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" strokeWidth={1.75} />}
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'pending', label: 'Đang làm' },
                { value: 'late', label: 'Chậm hạn' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value as typeof statusFilter)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setShowAddStudentModal(true)}
              leftIcon={<UserPlus className="h-5 w-5" strokeWidth={1.75} />}
            >
              Thêm
            </Button>
          </div>

          {/* Students List */}
          {filteredByStatus.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" strokeWidth={1.75} />}
              title="Không tìm thấy học sinh"
              description="Thử tìm kiếm với từ khóa khác"
            />
          ) : (
            <Card padding="none">
              <div className="divide-y divide-gray-100">
                {filteredByStatus.map((student) => {
                  const completionRate =
                    (student.stats.completedAssignments / student.stats.totalAssignments) * 100;
                  const status = getStudentStatus(student);

                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 hover:bg-[var(--bg-soft)] transition-colors"
                    >
                      {/* Avatar */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mono-200 dark:bg-mono-700 text-[var(--text-secondary)] font-semibold">
                        {student.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--text-primary)]">{student.name}</p>
                          <Badge variant="default">{student.studentCode}</Badge>
                          {status === 'late' && (
                            <Badge variant="error">Chậm hạn</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-tertiary)]">{student.email}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-[var(--text-tertiary)]">Hoàn thành</p>
                          <p className="font-medium">
                            {student.stats.completedAssignments}/{student.stats.totalAssignments}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-[var(--text-tertiary)]">Điểm TB</p>
                          <div className="flex items-center gap-1">
                            <p className="font-medium">{student.stats.averageScore}</p>
                            {student.stats.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-success" strokeWidth={1.75} />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-error" strokeWidth={1.75} />
                            )}
                          </div>
                        </div>
                        <div className="w-20">
                          <ProgressBar value={completionRate} size="sm" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/giao-vien/hoc-sinh/${student.id}`}>
                          <Button variant="ghost" size="sm">
                            Xem chi tiết
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveStudent(student)}
                          className="text-[var(--text-tertiary)] hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[var(--text-secondary)]">
              {mockAssignments.length} bài tập trong lớp này
            </p>
            <Link href="/giao-vien/bai-tap/tao-moi">
              <Button leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}>
                Tạo bài tập
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {mockAssignments.map((assignment) => {
              const progress = (assignment.submissionCount / assignment.totalStudents) * 100;

              return (
                <Link key={assignment.id} href={`/giao-vien/bai-tap/${assignment.id}`}>
                  <Card hover>
                    <div className="flex items-center gap-4">
                      <ProgressRing value={progress} size={56} strokeWidth={5}>
                        <span className="text-xs font-medium">{Math.round(progress)}%</span>
                      </ProgressRing>

                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">{assignment.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge
                            variant={
                              assignment.type === 'exam'
                                ? 'warning'
                                : assignment.type === 'quiz'
                                ? 'primary'
                                : 'default'
                            }
                          >
                            {assignment.type === 'exam'
                              ? 'Thi'
                              : assignment.type === 'quiz'
                              ? 'Kiểm tra'
                              : 'Bài tập'}
                          </Badge>
                          <span className="text-sm text-[var(--text-tertiary)]">
                            Hạn: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-mono-600 dark:text-mono-400">
                          {assignment.averageScore}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">Điểm TB</p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          {assignment.submissionCount}/{assignment.totalStudents}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">Đã nộp</p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan kết quả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <ProgressRing value={mockClassStats.completionRate} size={140} strokeWidth={12}>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[var(--text-primary)]">
                        {mockClassStats.averageScore}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)]">Điểm TB</p>
                    </div>
                  </ProgressRing>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-success/10 text-center">
                    <p className="text-2xl font-bold text-success">
                      {mockClassStats.topPerformers}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Học sinh giỏi</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10 text-center">
                    <p className="text-2xl font-bold text-warning">
                      {mockClassStats.needsAttention}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Cần hỗ trợ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weak Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Chủ đề cần ôn tập</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Dựa trên kết quả bài làm, đây là các chủ đề lớp còn yếu:
                </p>
                <div className="space-y-3">
                  {mockClassStats.weakTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20 text-warning font-medium text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{topic}</span>
                      </div>
                      <Badge variant="warning">Cần ôn</Badge>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" className="w-full mt-4">
                  Tạo bài ôn tập cho chủ đề này
                </Button>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Phân bố điểm số</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" strokeWidth={1.75} />}
                  >
                    Xuất báo cáo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-48 gap-2">
                  {[
                    { range: '0-4', count: 2, color: 'bg-error' },
                    { range: '4-5', count: 5, color: 'bg-warning' },
                    { range: '5-6', count: 8, color: 'bg-warning' },
                    { range: '6-7', count: 12, color: 'bg-mono-900 dark:bg-mono-100' },
                    { range: '7-8', count: 15, color: 'bg-mono-900 dark:bg-mono-100' },
                    { range: '8-9', count: 6, color: 'bg-success' },
                    { range: '9-10', count: 2, color: 'bg-success' },
                  ].map((bar) => (
                    <div key={bar.range} className="flex-1 flex flex-col items-center">
                      <div
                        className={cn('w-full rounded-t-apple-sm', bar.color)}
                        style={{ height: `${(bar.count / 15) * 100}%` }}
                      />
                      <p className="text-xs text-[var(--text-tertiary)] mt-2">{bar.range}</p>
                      <p className="text-sm font-medium">{bar.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Thêm học sinh"
      >
        <div className="py-4 space-y-4">
          <Input
            label="Email học sinh"
            placeholder="email@school.edu.vn"
            leftIcon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
          />
          <Input
            label="Mã học sinh"
            placeholder="VD: HS001"
          />
          <p className="text-sm text-[var(--text-tertiary)]">
            Hoặc chia sẻ mã mời <strong>{mockClass.inviteCode}</strong> để học sinh tự tham gia
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddStudentModal(false)}>
            Hủy
          </Button>
          <Button>Thêm học sinh</Button>
        </ModalFooter>
      </Modal>

      {/* Remove Student Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Xác nhận xóa học sinh"
      >
        {selectedStudent && (
          <div className="py-4">
            <p className="text-[var(--text-secondary)]">
              Bạn có chắc chắn muốn xóa <strong>{selectedStudent.name}</strong> khỏi lớp?
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              Học sinh sẽ không thể truy cập bài tập của lớp này nữa.
            </p>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Hủy
          </Button>
          <Button variant="destructive">Xóa học sinh</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
