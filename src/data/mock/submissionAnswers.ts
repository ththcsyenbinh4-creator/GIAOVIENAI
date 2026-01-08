import { SubmissionAnswer } from '@/types/domain';

/**
 * Mock Submission Answers Data
 *
 * Individual answers for each submission.
 * In production, this would be fetched from the database.
 */
export let mockSubmissionAnswers: SubmissionAnswer[] = [
  // Submission 1 (student-1, assg-1) - Pending grading
  {
    id: 'ans-1-1',
    submissionId: 'sub-1',
    questionId: 'q-1',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-1-2',
    submissionId: 'sub-1',
    questionId: 'q-2',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-1-3',
    submissionId: 'sub-1',
    questionId: 'q-3',
    selectedChoiceIndex: 0, // Wrong answer
    isCorrect: false,
    score: 0,
    teacherComment: null,
  },
  {
    id: 'ans-1-4',
    submissionId: 'sub-1',
    questionId: 'q-4',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-1-5',
    submissionId: 'sub-1',
    questionId: 'q-5',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-1-6',
    submissionId: 'sub-1',
    questionId: 'q-6',
    answerText:
      'a) Để vẽ đồ thị hàm số y = 2x - 4, ta tìm 2 điểm:\n- Cho x = 0: y = -4, được điểm (0, -4)\n- Cho y = 0: x = 2, được điểm (2, 0)\nVẽ đường thẳng qua 2 điểm trên.\n\nb) Giao điểm với Ox: (2, 0)\nGiao điểm với Oy: (0, -4)\n\nc) Diện tích tam giác = 1/2 × 2 × 4 = 4 (đơn vị diện tích)',
    score: null,
    aiSuggestion: {
      suggestedScore: 2.5,
      strengths: [
        'Trình bày rõ ràng các bước vẽ đồ thị',
        'Xác định đúng giao điểm với hai trục',
        'Tính toán diện tích chính xác',
      ],
      improvements: [
        'Cần ghi rõ đơn vị cho diện tích (ví dụ: cm²)',
        'Nên vẽ hình minh họa kèm theo',
      ],
      comment:
        'Bài làm khá tốt, học sinh hiểu rõ cách vẽ đồ thị và tìm giao điểm. Cần chú ý thêm về đơn vị và hình minh họa.',
    },
    teacherComment: null,
  },
  {
    id: 'ans-1-7',
    submissionId: 'sub-1',
    questionId: 'q-7',
    answerText:
      'Tìm phương trình đường thẳng qua A(1, 2) và B(3, 6):\n\nHệ số góc a = (6-2)/(3-1) = 4/2 = 2\n\nThay vào y = ax + b với điểm A(1, 2):\n2 = 2×1 + b\nb = 0\n\nVậy phương trình đường thẳng là y = 2x',
    score: null,
    aiSuggestion: {
      suggestedScore: 2.0,
      strengths: [
        'Áp dụng đúng công thức tính hệ số góc',
        'Tính toán chính xác',
        'Kết luận rõ ràng',
      ],
      improvements: [],
      comment: 'Bài làm hoàn chỉnh, trình bày logic và rõ ràng. Điểm tối đa.',
    },
    teacherComment: null,
  },

  // Submission 2 (student-2, assg-1) - Pending grading
  {
    id: 'ans-2-1',
    submissionId: 'sub-2',
    questionId: 'q-1',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-2-2',
    submissionId: 'sub-2',
    questionId: 'q-2',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-2-3',
    submissionId: 'sub-2',
    questionId: 'q-3',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-2-4',
    submissionId: 'sub-2',
    questionId: 'q-4',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-2-5',
    submissionId: 'sub-2',
    questionId: 'q-5',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-2-6',
    submissionId: 'sub-2',
    questionId: 'q-6',
    answerText:
      'a) Vẽ đồ thị y = 2x - 4:\nĐiểm (0, -4) và (2, 0)\n\nb) Ox: (2, 0), Oy: (0, -4)\n\nc) S = 4',
    score: null,
    aiSuggestion: {
      suggestedScore: 1.5,
      strengths: ['Xác định đúng các điểm cơ bản', 'Kết quả tính diện tích đúng'],
      improvements: [
        'Cần trình bày chi tiết hơn cách vẽ đồ thị',
        'Thiếu công thức tính diện tích',
        'Cần ghi đơn vị',
      ],
      comment: 'Bài làm đúng nhưng trình bày quá sơ sài. Cần viết đầy đủ các bước giải.',
    },
    teacherComment: null,
  },
  {
    id: 'ans-2-7',
    submissionId: 'sub-2',
    questionId: 'q-7',
    answerText: 'y = 2x\n\nVì qua (1,2): 2 = 2×1 đúng\nQua (3,6): 6 = 2×3 đúng',
    score: null,
    aiSuggestion: {
      suggestedScore: 1.0,
      strengths: ['Đáp án đúng', 'Có kiểm tra kết quả'],
      improvements: [
        'Không có quá trình tìm hệ số góc',
        'Không giải thích các bước',
        'Thiếu trình bày logic',
      ],
      comment:
        'Kết quả đúng nhưng không thể hiện quá trình suy luận. Đề yêu cầu giải thích các bước làm.',
    },
    teacherComment: null,
  },

  // Submission 3 (student-3, assg-1) - Graded
  {
    id: 'ans-3-1',
    submissionId: 'sub-3',
    questionId: 'q-1',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-3-2',
    submissionId: 'sub-3',
    questionId: 'q-2',
    selectedChoiceIndex: 1, // Wrong
    isCorrect: false,
    score: 0,
    teacherComment: null,
  },
  {
    id: 'ans-3-3',
    submissionId: 'sub-3',
    questionId: 'q-3',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-3-4',
    submissionId: 'sub-3',
    questionId: 'q-4',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-3-5',
    submissionId: 'sub-3',
    questionId: 'q-5',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 0.5,
    teacherComment: null,
  },
  {
    id: 'ans-3-6',
    submissionId: 'sub-3',
    questionId: 'q-6',
    answerText:
      'a) Đồ thị hàm số y = 2x - 4 là đường thẳng qua (0, -4) và (2, 0)\n\nb) Giao với Ox: (2, 0). Giao với Oy: (0, -4)\n\nc) Diện tích = 1/2 × |2| × |-4| = 4 đvdt',
    score: 2.5,
    aiSuggestion: {
      suggestedScore: 2.5,
      strengths: ['Làm đúng tất cả các ý', 'Có ghi đơn vị'],
      improvements: ['Có thể vẽ hình minh họa'],
      comment: 'Bài làm tốt!',
    },
    teacherComment: 'Tốt lắm! Lần sau em vẽ thêm hình nhé.',
  },
  {
    id: 'ans-3-7',
    submissionId: 'sub-3',
    questionId: 'q-7',
    answerText:
      'Đường thẳng qua A(1,2) và B(3,6) có dạng y = ax + b\na = (y2-y1)/(x2-x1) = (6-2)/(3-1) = 2\nThay A(1,2): 2 = 2.1 + b => b = 0\nPhương trình: y = 2x',
    score: 2.0,
    aiSuggestion: {
      suggestedScore: 2.0,
      strengths: ['Hoàn chỉnh', 'Rõ ràng'],
      improvements: [],
      comment: 'Xuất sắc!',
    },
    teacherComment: 'Chính xác!',
  },

  // Submission 7 (student-6, assg-3) - Pending grading
  {
    id: 'ans-7-1',
    submissionId: 'sub-7',
    questionId: 'q-13',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 1,
    teacherComment: null,
  },
  {
    id: 'ans-7-2',
    submissionId: 'sub-7',
    questionId: 'q-14',
    selectedChoiceIndex: 0,
    isCorrect: true,
    score: 1,
    teacherComment: null,
  },
  {
    id: 'ans-7-3',
    submissionId: 'sub-7',
    questionId: 'q-15',
    selectedChoiceIndex: 2,
    isCorrect: true,
    score: 1,
    teacherComment: null,
  },
  {
    id: 'ans-7-4',
    submissionId: 'sub-7',
    questionId: 'q-16',
    answerText:
      'Vẽ đồ thị y = -x + 3:\n- Khi x = 0: y = 3, điểm (0, 3) - giao Oy\n- Khi y = 0: x = 3, điểm (3, 0) - giao Ox\n\nVẽ đường thẳng qua 2 điểm trên.',
    score: null,
    aiSuggestion: {
      suggestedScore: 1.5,
      strengths: ['Xác định đúng các điểm giao', 'Trình bày rõ ràng'],
      improvements: ['Thiếu hình vẽ thực tế'],
      comment: 'Cần có hình vẽ minh họa để được điểm tối đa.',
    },
    teacherComment: null,
  },

  // Submission 8 (student-7, assg-3) - Pending grading
  {
    id: 'ans-8-1',
    submissionId: 'sub-8',
    questionId: 'q-13',
    selectedChoiceIndex: 1,
    isCorrect: true,
    score: 1,
    teacherComment: null,
  },
  {
    id: 'ans-8-2',
    submissionId: 'sub-8',
    questionId: 'q-14',
    selectedChoiceIndex: 2, // Wrong
    isCorrect: false,
    score: 0,
    teacherComment: null,
  },
  {
    id: 'ans-8-3',
    submissionId: 'sub-8',
    questionId: 'q-15',
    selectedChoiceIndex: 2,
    isCorrect: true,
    score: 1,
    teacherComment: null,
  },
  {
    id: 'ans-8-4',
    submissionId: 'sub-8',
    questionId: 'q-16',
    answerText: 'y = -x + 3\nGiao Ox: (3, 0)\nGiao Oy: (0, 3)',
    score: null,
    aiSuggestion: {
      suggestedScore: 1.0,
      strengths: ['Kết quả đúng'],
      improvements: ['Quá ngắn gọn', 'Không có hình vẽ', 'Không giải thích cách làm'],
      comment: 'Cần trình bày đầy đủ hơn và vẽ đồ thị.',
    },
    teacherComment: null,
  },
];

// Helper to get answers by submission ID
export function getAnswersBySubmissionId(submissionId: string): SubmissionAnswer[] {
  return mockSubmissionAnswers.filter((a) => a.submissionId === submissionId);
}

// Helper to update answers
export function updateAnswersInStore(
  submissionId: string,
  updates: Array<{ questionId: string; score: number; teacherComment?: string }>
): void {
  updates.forEach((update) => {
    const answer = mockSubmissionAnswers.find(
      (a) => a.submissionId === submissionId && a.questionId === update.questionId
    );
    if (answer) {
      answer.score = update.score;
      if (update.teacherComment !== undefined) {
        answer.teacherComment = update.teacherComment;
      }
    }
  });
}

// Helper to add answers
export function addAnswers(answers: SubmissionAnswer[]): void {
  mockSubmissionAnswers.push(...answers);
}

// Counter for generating new IDs
let answerIdCounter = 100;

// Helper to generate new answer ID
export function generateAnswerId(): string {
  return `ans-gen-${answerIdCounter++}`;
}

// Helper to update student answers (for doing assignment)
export function updateStudentAnswers(
  submissionId: string,
  updates: Array<{
    questionId: string;
    selectedChoiceIndex?: number | null;
    answerText?: string | null;
  }>
): void {
  updates.forEach((update) => {
    const answer = mockSubmissionAnswers.find(
      (a) => a.submissionId === submissionId && a.questionId === update.questionId
    );
    if (answer) {
      if (update.selectedChoiceIndex !== undefined) {
        answer.selectedChoiceIndex = update.selectedChoiceIndex;
      }
      if (update.answerText !== undefined) {
        answer.answerText = update.answerText ?? undefined;
      }
    }
  });
}
