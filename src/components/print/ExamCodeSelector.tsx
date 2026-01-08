'use client';

import { cn } from '@/lib/utils';
import { ExamCodeLetter } from '@/types/domain';

interface ExamCodeSelectorProps {
  selectedCodes: ExamCodeLetter[];
  onChange: (codes: ExamCodeLetter[]) => void;
  disabled?: boolean;
}

const ALL_CODES: ExamCodeLetter[] = ['A', 'B', 'C', 'D'];

export function ExamCodeSelector({
  selectedCodes,
  onChange,
  disabled = false,
}: ExamCodeSelectorProps) {
  const toggleCode = (code: ExamCodeLetter) => {
    if (disabled) return;

    if (selectedCodes.includes(code)) {
      // Don't allow deselecting if it's the only one selected
      if (selectedCodes.length === 1) return;
      onChange(selectedCodes.filter((c) => c !== code));
    } else {
      onChange([...selectedCodes, code].sort() as ExamCodeLetter[]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onChange([...ALL_CODES]);
  };

  const selectSingle = () => {
    if (disabled) return;
    onChange(['A']);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[var(--text-primary)]">Chọn mã đề:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            className="text-sm text-[var(--accent)] hover:underline disabled:opacity-50"
          >
            Chọn tất cả
          </button>
          <span className="text-[var(--text-tertiary)]">|</span>
          <button
            type="button"
            onClick={selectSingle}
            disabled={disabled}
            className="text-sm text-[var(--text-secondary)] hover:underline disabled:opacity-50"
          >
            Chỉ mã A
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {ALL_CODES.map((code) => {
          const isSelected = selectedCodes.includes(code);
          return (
            <button
              key={code}
              type="button"
              onClick={() => toggleCode(code)}
              disabled={disabled}
              className={cn(
                'aspect-square rounded-xl text-2xl font-bold transition-all',
                'border-2 flex items-center justify-center',
                isSelected
                  ? 'bg-mono-900 dark:bg-mono-100 text-white dark:text-mono-900 border-mono-900 dark:border-mono-100 shadow-lg'
                  : 'bg-mono-100 dark:bg-mono-800 text-mono-400 border-mono-200 dark:border-mono-700 hover:border-mono-400 dark:hover:border-mono-500',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {code}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[var(--text-tertiary)] text-center">
        Đã chọn {selectedCodes.length} mã đề: {selectedCodes.join(', ')}
      </p>
    </div>
  );
}

export default ExamCodeSelector;
