/**
 * Exam Document PDF Template
 *
 * Generates printable exam PDFs with shuffled questions and answer options.
 * Supports multiple exam code variants (A, B, C, D).
 */

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { AssignmentDetail, Question, ExamCodeData } from '@/types/domain';
import { getShuffledChoices } from '@/services/print/exam-code-generator';
import { examStyles } from './styles';

interface ExamDocumentProps {
  assignment: AssignmentDetail;
  examCodes: ExamCodeData[];
  copiesPerCode: number;
  options: {
    paperSize: 'A4' | 'LETTER';
    fontSize: 'small' | 'medium' | 'large';
    headerText?: string;
    schoolName?: string;
    showStudentInfo?: boolean;
    showAnswerGrid?: boolean;
  };
}

// Question component
function QuestionBlock({
  question,
  questionNumber,
  shuffledChoices,
}: {
  question: Question;
  questionNumber: number;
  shuffledChoices: string[];
}) {
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <View style={examStyles.questionSection} wrap={false}>
      <View style={examStyles.questionHeader}>
        <Text style={examStyles.questionNumber}>Câu {questionNumber}.</Text>
        <Text style={examStyles.questionPrompt}>{question.prompt}</Text>
      </View>

      {question.type === 'mcq' && shuffledChoices.length > 0 && (
        <View style={examStyles.optionsContainer}>
          {shuffledChoices.map((choice, index) => (
            <View key={index} style={examStyles.optionRow}>
              <Text style={examStyles.optionLabel}>{optionLabels[index]}.</Text>
              <Text style={examStyles.optionText}>{choice}</Text>
            </View>
          ))}
        </View>
      )}

      {question.type === 'essay' && (
        <View style={examStyles.essayArea}>
          <Text style={examStyles.essayPlaceholder}>
            (Phần trả lời - {question.maxScore} điểm)
          </Text>
        </View>
      )}
    </View>
  );
}

// Answer grid for MCQ bubble sheet
function AnswerGrid({ mcqCount }: { mcqCount: number }) {
  const optionLabels = ['A', 'B', 'C', 'D'];
  const rows = [];

  for (let i = 0; i < mcqCount; i++) {
    rows.push(
      <View key={i} style={examStyles.answerGridRow}>
        <Text style={examStyles.answerGridNumber}>{i + 1}.</Text>
        <View style={examStyles.answerGridOptions}>
          {optionLabels.map((label) => (
            <View key={label} style={examStyles.answerBubble}>
              <Text style={examStyles.answerBubbleText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={examStyles.answerGridContainer}>
      <Text style={examStyles.answerGridTitle}>PHIẾU TRẢ LỜI TRẮC NGHIỆM</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {rows}
      </View>
    </View>
  );
}

// Single exam page
function ExamPage({
  assignment,
  examCode,
  pageNumber,
  totalPages,
  options,
}: {
  assignment: AssignmentDetail;
  examCode: ExamCodeData;
  pageNumber: number;
  totalPages: number;
  options: ExamDocumentProps['options'];
}) {
  // Get questions in shuffled order
  const orderedQuestions = examCode.questionOrder.map((qId) =>
    assignment.questions.find((q) => q.id === qId)!
  );

  const mcqQuestions = orderedQuestions.filter((q) => q.type === 'mcq');

  return (
    <Page size={options.paperSize} style={examStyles.page}>
      {/* Header */}
      <View style={examStyles.header}>
        <View style={examStyles.schoolInfo}>
          <Text style={examStyles.schoolName}>
            {options.schoolName || 'TRƯỜNG THCS/THPT'}
          </Text>
          <Text>{options.headerText || 'Năm học 2024-2025'}</Text>
        </View>
        <View style={examStyles.examCodeBox}>
          <Text style={examStyles.examCodeLabel}>MÃ ĐỀ</Text>
          <Text style={examStyles.examCode}>{examCode.code}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={examStyles.title}>{assignment.title}</Text>
      <Text style={examStyles.subtitle}>
        {assignment.type === 'test' ? 'Bài kiểm tra' : 'Bài tập'}
        {assignment.durationMinutes && ` • Thời gian: ${assignment.durationMinutes} phút`}
        {` • ${orderedQuestions.length} câu hỏi`}
      </Text>

      {/* Student Info */}
      {options.showStudentInfo !== false && (
        <View style={examStyles.studentInfoSection}>
          <View style={examStyles.studentInfoField}>
            <Text style={examStyles.studentInfoLabel}>Họ và tên:</Text>
            <View style={examStyles.studentInfoLine} />
          </View>
          <View style={[examStyles.studentInfoField, { flex: 0.5 }]}>
            <Text style={examStyles.studentInfoLabel}>Lớp:</Text>
            <View style={examStyles.studentInfoLine} />
          </View>
          <View style={[examStyles.studentInfoField, { flex: 0.5, marginRight: 0 }]}>
            <Text style={examStyles.studentInfoLabel}>SBD:</Text>
            <View style={examStyles.studentInfoLine} />
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={examStyles.instructions}>
        <Text style={examStyles.instructionsTitle}>Hướng dẫn làm bài:</Text>
        <Text style={examStyles.instructionsText}>
          • Đối với câu trắc nghiệm: Chọn một đáp án đúng nhất và tô vào phiếu trả lời.
          {'\n'}• Đối với câu tự luận: Viết câu trả lời vào phần để trống.
          {'\n'}• Không được sử dụng tài liệu trong quá trình làm bài.
        </Text>
      </View>

      {/* Questions */}
      {orderedQuestions.map((question, index) => {
        const shuffledChoices =
          question.type === 'mcq'
            ? getShuffledChoices(question, examCode.answerMappings[question.id])
            : [];

        return (
          <QuestionBlock
            key={question.id}
            question={question}
            questionNumber={index + 1}
            shuffledChoices={shuffledChoices}
          />
        );
      })}

      {/* Answer Grid */}
      {options.showAnswerGrid !== false && mcqQuestions.length > 0 && (
        <AnswerGrid mcqCount={mcqQuestions.length} />
      )}

      {/* Footer */}
      <View style={examStyles.footer} fixed>
        <Text>Mã đề: {examCode.code}</Text>
        <Text>
          Trang {pageNumber} / {totalPages}
        </Text>
      </View>
    </Page>
  );
}

// Main Exam Document component
export function ExamDocument({
  assignment,
  examCodes,
  copiesPerCode,
  options,
}: ExamDocumentProps) {
  const pages: React.ReactNode[] = [];
  let pageNumber = 1;

  // Calculate total pages
  const totalPages = examCodes.length * copiesPerCode;

  // Generate pages for each exam code and copy
  examCodes.forEach((examCode) => {
    for (let copy = 0; copy < copiesPerCode; copy++) {
      pages.push(
        <ExamPage
          key={`${examCode.code}-${copy}`}
          assignment={assignment}
          examCode={examCode}
          pageNumber={pageNumber}
          totalPages={totalPages}
          options={options}
        />
      );
      pageNumber++;
    }
  });

  return <Document>{pages}</Document>;
}

export default ExamDocument;
