/**
 * Answer Key Document PDF Template
 *
 * Generates printable answer key PDFs for all exam code variants.
 */

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { AssignmentDetail, Question, ExamCodeData } from '@/types/domain';
import { generateAnswerKeySummary, getCorrectAnswerLetter } from '@/services/print/exam-code-generator';
import { examStyles } from './styles';

interface AnswerKeyDocumentProps {
  assignment: AssignmentDetail;
  examCodes: ExamCodeData[];
  options: {
    paperSize: 'A4' | 'LETTER';
    schoolName?: string;
    showQuestionContent?: boolean;
  };
}

// Answer key table for a single exam code
function AnswerKeyTable({
  examCode,
  questions,
  showContent,
}: {
  examCode: ExamCodeData;
  questions: Question[];
  showContent?: boolean;
}) {
  const summary = generateAnswerKeySummary(examCode, questions);

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={[examStyles.answerKeyRow, examStyles.answerKeyRowHeader]}>
        <Text style={examStyles.answerKeyCellNumber}>Câu</Text>
        <Text style={examStyles.answerKeyCellAnswer}>Đáp án</Text>
        <Text style={examStyles.answerKeyCellPoints}>Điểm</Text>
        {showContent && <Text style={[examStyles.answerKeyCell, { flex: 2 }]}>Nội dung</Text>}
      </View>

      {summary.map((item, index) => {
        const questionId = examCode.questionOrder[index];
        const question = questions.find((q) => q.id === questionId);

        return (
          <View key={index} style={examStyles.answerKeyRow}>
            <Text style={examStyles.answerKeyCellNumber}>{item.questionNumber}</Text>
            <Text style={examStyles.answerKeyCellAnswer}>{item.answer}</Text>
            <Text style={examStyles.answerKeyCellPoints}>{item.points}</Text>
            {showContent && (
              <Text style={[examStyles.answerKeyCell, { flex: 2, textAlign: 'left', fontSize: 9 }]}>
                {question?.prompt.substring(0, 50)}
                {question && question.prompt.length > 50 ? '...' : ''}
              </Text>
            )}
          </View>
        );
      })}

      {/* Total row */}
      <View style={[examStyles.answerKeyRow, { borderTopWidth: 2, borderTopColor: '#000' }]}>
        <Text style={[examStyles.answerKeyCellNumber, { fontWeight: 'bold' }]}>Tổng</Text>
        <Text style={examStyles.answerKeyCellAnswer}>-</Text>
        <Text style={[examStyles.answerKeyCellPoints, { fontWeight: 'bold' }]}>
          {summary.reduce((sum, item) => sum + item.points, 0)}
        </Text>
        {showContent && <Text style={[examStyles.answerKeyCell, { flex: 2 }]}></Text>}
      </View>
    </View>
  );
}

// Main Answer Key Document component
export function AnswerKeyDocument({
  assignment,
  examCodes,
  options,
}: AnswerKeyDocumentProps) {
  return (
    <Document>
      <Page size={options.paperSize} style={examStyles.page}>
        {/* Header */}
        <View style={examStyles.answerKeyHeader}>
          <Text style={examStyles.answerKeyTitle}>ĐÁP ÁN - {assignment.title.toUpperCase()}</Text>
          <Text style={examStyles.answerKeySubtitle}>
            {options.schoolName || 'TRƯỜNG THCS/THPT'} • {examCodes.length} mã đề
          </Text>
        </View>

        {/* Answer keys for each code */}
        {examCodes.map((examCode) => (
          <View key={examCode.code} style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginRight: 10 }}>
                MÃ ĐỀ {examCode.code}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            </View>

            <AnswerKeyTable
              examCode={examCode}
              questions={assignment.questions}
              showContent={options.showQuestionContent}
            />
          </View>
        ))}

        {/* Quick reference grid - all codes side by side */}
        {examCodes.length > 1 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>
              BẢNG ĐỐI CHIẾU ĐÁP ÁN NHANH
            </Text>

            {/* Header row */}
            <View style={[examStyles.answerKeyRow, examStyles.answerKeyRowHeader]}>
              <Text style={[examStyles.answerKeyCellNumber, { width: 40 }]}>Câu</Text>
              {examCodes.map((code) => (
                <Text key={code.code} style={[examStyles.answerKeyCell, { fontWeight: 'bold' }]}>
                  Mã {code.code}
                </Text>
              ))}
            </View>

            {/* Data rows */}
            {examCodes[0].questionOrder.map((_, qIndex) => (
              <View key={qIndex} style={examStyles.answerKeyRow}>
                <Text style={[examStyles.answerKeyCellNumber, { width: 40 }]}>{qIndex + 1}</Text>
                {examCodes.map((examCode) => {
                  const questionId = examCode.questionOrder[qIndex];
                  const answer = getCorrectAnswerLetter(questionId, examCode.answerKey);
                  return (
                    <Text key={examCode.code} style={examStyles.answerKeyCell}>
                      {answer}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={examStyles.footer} fixed>
          <Text>Đáp án - {assignment.title}</Text>
          <Text>Tổng điểm: {assignment.questions.reduce((sum, q) => sum + q.maxScore, 0)}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default AnswerKeyDocument;
