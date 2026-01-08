'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  UserPlus,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/header';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFloatingActions } from '@/components/layout/floating-actions-context';

// Mock data
const mockClasses = [
  {
    id: 'class-1',
    name: 'Lớp 8A',
    description: 'Toán học - Năm học 2024-2025',
    studentCount: 50,
    inviteCode: 'ABC12345',
    coverColor: 'bg-sky-600 dark:bg-sky-700',
    stats: {
      totalAssignments: 12,
      completedRate: 85,
      pendingGrading: 5,
      averageScore: 7.8,
    },
    recentActivity: '2 bài tập mới hôm nay',
  },
  {
    id: 'class-2',
    name: 'Lớp 8B',
    description: 'Toán học - Năm học 2024-2025',
    studentCount: 48,
    inviteCode: 'XYZ98765',
    coverColor: 'bg-success',
    stats: {
      totalAssignments: 10,
      completedRate: 78,
      pendingGrading: 3,
      averageScore: 7.2,
    },
    recentActivity: '1 bài kiểm tra đến hạn',
  },
  {
    id: 'class-3',
    name: 'Lớp 9A',
    description: 'Toán học - Năm học 2024-2025',
    studentCount: 52,
    inviteCode: 'DEF45678',
    coverColor: 'bg-warning',
    stats: {
      totalAssignments: 15,
      completedRate: 92,
      pendingGrading: 8,
      averageScore: 8.1,
    },
    recentActivity: 'Ôn tập cuối kỳ đang diễn ra',
  },
];

export default function ClassesPage() {
  const { setActionButton } = useFloatingActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<typeof mockClasses[0] | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
  });

  // Set floating action button - using Link instead of onClick to avoid stale closure
  useEffect(() => {
    setActionButton(
      <Link href="/giao-vien/lop-hoc/tao-moi">
        <Button leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}>
          Tạo lớp mới
        </Button>
      </Link>
    );
    return () => setActionButton(null);
  }, [setActionButton]);

  // Filter classes
  const filteredClasses = mockClasses.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = async () => {
    setIsCreating(true);
    // PHASE 2: Call real API to create class
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCreating(false);
    setShowCreateModal(false);
    setNewClass({ name: '', description: '' });
  };

  const handleCopyInviteCode = () => {
    if (selectedClass) {
      navigator.clipboard.writeText(selectedClass.inviteCode);
      // PHASE 2: Add toast notification for copy success
    }
  };

  const handleShowInvite = (cls: typeof mockClasses[0]) => {
    setSelectedClass(cls);
    setShowInviteModal(true);
    setShowMenu(null);
  };

  const handleShowDelete = (cls: typeof mockClasses[0]) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
    setShowMenu(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Lớp học"
        subtitle={`${mockClasses.length} lớp • ${mockClasses.reduce((sum, c) => sum + c.studentCount, 0)} học sinh`}
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-5 w-5" strokeWidth={1.75} />}
        />
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" strokeWidth={1.75} />}
          title="Chưa có lớp học nào"
          description="Tạo lớp học đầu tiên để bắt đầu giao bài tập cho học sinh"
          action={{
            label: 'Tạo lớp mới',
            onClick: () => setShowCreateModal(true),
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} padding="none" hover className="overflow-hidden group">
              {/* Cover */}
              <div className={cn('h-24 relative', cls.coverColor)}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                  <p className="text-sm text-white/80">{cls.description}</p>
                </div>

                {/* Menu Button */}
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(showMenu === cls.id ? null : cls.id);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
                  </Button>

                  {showMenu === cls.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl bg-white dark:bg-mono-800 shadow-apple-lg overflow-hidden">
                        <button
                          onClick={() => handleShowInvite(cls)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700"
                        >
                          <Share2 className="h-4 w-4" strokeWidth={1.75} />
                          Mời học sinh
                        </button>
                        <Link
                          href={`/giao-vien/lop-hoc/${cls.id}/chinh-sua`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700"
                        >
                          <Edit className="h-4 w-4" strokeWidth={1.75} />
                          Chỉnh sửa
                        </Link>
                        <div className="h-px bg-mono-200 dark:bg-mono-600 mx-2" />
                        <button
                          onClick={() => handleShowDelete(cls)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          Xóa lớp
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <Link href={`/giao-vien/lop-hoc/${cls.id}`}>
                <div className="p-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {cls.studentCount} học sinh
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {cls.stats.totalAssignments} bài tập
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" strokeWidth={1.75} />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {cls.stats.completedRate}% hoàn thành
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" strokeWidth={1.75} />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {cls.stats.pendingGrading} chờ chấm
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <ProgressBar
                    value={cls.stats.completedRate}
                    size="sm"
                    className="mb-3"
                  />

                  {/* Recent Activity */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-tertiary)]">{cls.recentActivity}</p>
                    <ChevronRight
                      className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-mono-600 dark:text-mono-400 transition-colors"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo lớp học mới"
      >
        <div className="space-y-4 py-2">
          <Input
            label="Tên lớp *"
            placeholder="VD: Lớp 8A"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          />
          <Input
            label="Mô tả"
            placeholder="VD: Toán học - Năm học 2024-2025"
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleCreateClass}
            disabled={!newClass.name}
            isLoading={isCreating}
          >
            Tạo lớp
          </Button>
        </ModalFooter>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Mời học sinh vào lớp"
      >
        {selectedClass && (
          <div className="py-4">
            <p className="text-[var(--text-secondary)] mb-4">
              Chia sẻ mã mời này cho học sinh để tham gia lớp{' '}
              <strong>{selectedClass.name}</strong>
            </p>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
              <div className="flex-1">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Mã mời</p>
                <p className="text-2xl font-mono font-bold text-[var(--text-primary)] tracking-wider">
                  {selectedClass.inviteCode}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleCopyInviteCode}
                leftIcon={<Copy className="h-5 w-5" strokeWidth={1.75} />}
              >
                Sao chép
              </Button>
            </div>

            <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
              Học sinh nhập mã này tại trang "Tham gia lớp học"
            </p>
          </div>
        )}
        <ModalFooter>
          <Button onClick={() => setShowInviteModal(false)}>Đóng</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa lớp"
      >
        {selectedClass && (
          <div className="py-4">
            <p className="text-[var(--text-secondary)]">
              Bạn có chắc chắn muốn xóa lớp <strong>{selectedClass.name}</strong>?
            </p>
            <p className="text-sm text-error mt-2">
              Hành động này không thể hoàn tác. Tất cả bài tập và dữ liệu học sinh sẽ bị xóa.
            </p>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="destructive">Xóa lớp</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
