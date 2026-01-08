'use client';

/**
 * WorksheetViewer Component
 *
 * A comprehensive worksheet viewer that displays various question types
 * with answers and explanations for teacher preview.
 */

import { useState } from 'react';
import {
  FileText,
  Eye,
  EyeOff,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Worksheet, WorksheetQuestion } from '@/types/domain';
import { cn } from '@/lib/utils';

interface WorksheetViewerProps {
  worksheet: Worksheet;
  mode: 'preview' | 'print';
  showAnswers?: boolean;
  onClose?: () => void;
}

export function WorksheetViewer({
  worksheet,
  mode,
  showAnswers: initialShowAnswers = true,
  onClose,
}: WorksheetViewerProps) {
  const [showAnswers, setShowAnswers] = useState(initialShowAnswers);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set());

  const toggleExplanation = (questionId: string) => {
    const newExpanded = new Set(expandedExplanations);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedExplanations(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {worksheet.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-[var(--text-tertiary)]">
              {worksheet.subject && <span>{worksheet.subject}</span>}
              {worksheet.gradeLevel && (
                <>
                  <span>•</span>
                  <span>{worksheet.gradeLevel}</span>
                </>
              )}
              <span>•</span>
              <span>{worksheet.questions.length} câu hỏi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-[var(--text-secondary)]">
              <Award className="h-4 w-4" strokeWidth={1.75} />
              <span>{worksheet.totalPoints} điểm</span>
            </div>
            {worksheet.estimatedMinutes && (
              <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
                <span>{worksheet.estimatedMinutes} phút</span>
              </div>
            )}
          </div>

          {mode === 'preview' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" strokeWidth={1.75} />
                  Ẩn đáp án
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" strokeWidth={1.75} />
                  Hiện đáp án
                </>
              )}
            </Button>
          )}

          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      {worksheet.instructions && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">Hướng dẫn:</span> {worksheet.instructions}
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {worksheet.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              showAnswer={showAnswers}
              isExplanationExpanded={expandedExplanations.has(question.id)}
              onToggleExplanation={() => toggleExplanation(question.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: WorksheetQuestion;
  index: number;
  showAnswer: boolean;
  isExplanationExpanded: boolean;
  onToggleExplanation: () => void;
}

function QuestionCard({
  question,
  index,
  showAnswer,
  isExplanationExpanded,
  onToggleExplanation,
}: QuestionCardProps) {
  const typeLabels: Record<string, string> = {
    'fill-blank': 'Điền chỗ trống',
    'matching': 'Nối cột',
    'true-false': 'Đúng/Sai',
    'short-answer': 'Trả lời ngắn',
    'ordering': 'Sắp xếp',
    'mcq': 'Trắc nghiệm',
  };

  return (
    <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] overflow-hidden">
      {/* Question header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-soft)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mono-200 dark:bg-mono-700 text-sm font-semibold text-[var(--text-primary)]">
            {index + 1}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-mono-100 dark:bg-mono-800 text-[var(--text-tertiary)]">
            {typeLabels[question.type] || question.type}
          </span>
        </div>
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {question.points} điểm
        </span>
      </div>

      {/* Question content */}
      <div className="p-4">
        <p className="text-[var(--text-primary)] mb-4">{question.question}</p>

        {/* Render based on question type */}
        {question.type === 'mcq' && question.choices && (
          <MCQContent
            choices={question.choices}
            correctIndex={question.correctAnswerIndex}
            showAnswer={showAnswer}
          />
        )}

        {question.type === 'true-false' && (
          <TrueFalseContent isTrue={question.isTrue} showAnswer={showAnswer} />
        )}

        {question.type === 'fill-blank' && question.blanks && (
          <FillBlankContent blanks={question.blanks} showAnswer={showAnswer} />
        )}

        {question.type === 'matching' && question.matchingPairs && (
          <MatchingContent pairs={question.matchingPairs} showAnswer={showAnswer} />
        )}

        {question.type === 'ordering' && question.orderItems && (
          <OrderingContent items={question.orderItems} showAnswer={showAnswer} />
        )}

        {question.type === 'short-answer' && question.expectedAnswer && (
          <ShortAnswerContent answer={question.expectedAnswer} showAnswer={showAnswer} />
        )}

        {/* Explanation */}
        {question.explanation && showAnswer && (
          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <button
              onClick={onToggleExplanation}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {isExplanationExpanded ? (
                <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              )}
              Xem giải thích
            </button>
            {isExplanationExpanded && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MCQContent({
  choices,
  correctIndex,
  showAnswer,
}: {
  choices: string[];
  correctIndex?: number;
  showAnswer: boolean;
}) {
  return (
    <div className="space-y-2">
      {choices.map((choice, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border',
            showAnswer && i === correctIndex
              ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
              : 'border-[var(--border-default)]'
          )}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800 text-xs font-medium">
            {String.fromCharCode(65 + i)}
          </span>
          <span className="text-[var(--text-primary)] flex-1">{choice}</span>
          {showAnswer && i === correctIndex && (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" strokeWidth={1.75} />
          )}
        </div>
      ))}
    </div>
  );
}

function TrueFalseContent({
  isTrue,
  showAnswer,
}: {
  isTrue?: boolean;
  showAnswer: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          'flex-1 p-3 rounded-lg border text-center',
          showAnswer && isTrue === true
            ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
            : 'border-[var(--border-default)]'
        )}
      >
        <span className="font-medium text-[var(--text-primary)]">Đúng</span>
        {showAnswer && isTrue === true && (
          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mt-1" strokeWidth={1.75} />
        )}
      </div>
      <div
        className={cn(
          'flex-1 p-3 rounded-lg border text-center',
          showAnswer && isTrue === false
            ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
            : 'border-[var(--border-default)]'
        )}
      >
        <span className="font-medium text-[var(--text-primary)]">Sai</span>
        {showAnswer && isTrue === false && (
          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mt-1" strokeWidth={1.75} />
        )}
      </div>
    </div>
  );
}

function FillBlankContent({
  blanks,
  showAnswer,
}: {
  blanks: string[];
  showAnswer: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--text-tertiary)]">Đáp án cho các chỗ trống:</p>
      {showAnswer ? (
        <div className="flex flex-wrap gap-2">
          {blanks.map((blank, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium"
            >
              {i + 1}. {blank}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {blanks.map((_, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-mono-100 dark:bg-mono-800 text-[var(--text-tertiary)] rounded-lg text-sm"
            >
              {i + 1}. ___________
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchingContent({
  pairs,
  showAnswer,
}: {
  pairs: Array<{ left: string; right: string }>;
  showAnswer: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Cột A</p>
        {pairs.map((pair, i) => (
          <div
            key={i}
            className="p-2 bg-mono-100 dark:bg-mono-800 rounded-lg text-sm"
          >
            <span className="font-medium mr-2">{i + 1}.</span>
            {pair.left}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Cột B</p>
        {showAnswer ? (
          pairs.map((pair, i) => (
            <div
              key={i}
              className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm text-green-800 dark:text-green-200"
            >
              <span className="font-medium mr-2">{String.fromCharCode(97 + i)}.</span>
              {pair.right}
            </div>
          ))
        ) : (
          // Shuffled display for student mode
          [...pairs]
            .sort(() => Math.random() - 0.5)
            .map((pair, i) => (
              <div
                key={i}
                className="p-2 bg-mono-100 dark:bg-mono-800 rounded-lg text-sm"
              >
                <span className="font-medium mr-2">{String.fromCharCode(97 + i)}.</span>
                {pair.right}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function OrderingContent({
  items,
  showAnswer,
}: {
  items: string[];
  showAnswer: boolean;
}) {
  const displayItems = showAnswer
    ? items
    : [...items].sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--text-tertiary)]">
        {showAnswer ? 'Thứ tự đúng:' : 'Sắp xếp theo thứ tự đúng:'}
      </p>
      <div className="space-y-2">
        {displayItems.map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              showAnswer
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                : 'border-[var(--border-default)]'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                showAnswer
                  ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                  : 'bg-mono-200 dark:bg-mono-700'
              )}
            >
              {i + 1}
            </span>
            <span className="text-[var(--text-primary)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortAnswerContent({
  answer,
  showAnswer,
}: {
  answer: string;
  showAnswer: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="h-20 rounded-lg border border-dashed border-[var(--border-default)] bg-mono-50 dark:bg-mono-800/50 flex items-center justify-center">
        <span className="text-sm text-[var(--text-tertiary)]">
          [Chỗ trả lời của học sinh]
        </span>
      </div>
      {showAnswer && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-[var(--text-tertiary)] mb-1">Đáp án mẫu:</p>
          <p className="text-green-800 dark:text-green-200">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default WorksheetViewer;
