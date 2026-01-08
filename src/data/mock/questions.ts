import { Question } from '@/types/domain';

/**
 * Mock Questions Data
 *
 * Sample questions for each assignment.
 * In production, this would be fetched from the database.
 */
export let mockQuestions: Question[] = [
  // Assignment 1: Bài kiểm tra Chương 3 (class-8a)
  {
    id: 'q-1',
    assignmentId: 'assg-1',
    order: 1,
    type: 'mcq',
    prompt: 'Hàm số y = 2x + 1 có đồ thị đi qua điểm nào sau đây?',
    choices: ['(0, 1)', '(1, 0)', '(0, 2)', '(2, 0)'],
    correctAnswerIndex: 0,
    maxScore: 0.5,
    source: 'manual',
  },
  {
    id: 'q-2',
    assignmentId: 'assg-1',
    order: 2,
    type: 'mcq',
    prompt: 'Cho hàm số y = ax + b. Nếu a > 0 thì đồ thị hàm số:',
    choices: [
      'Đi lên từ trái sang phải',
      'Đi xuống từ trái sang phải',
      'Song song với trục Ox',
      'Song song với trục Oy',
    ],
    correctAnswerIndex: 0,
    maxScore: 0.5,
    source: 'manual',
  },
  {
    id: 'q-3',
    assignmentId: 'assg-1',
    order: 3,
    type: 'mcq',
    prompt: 'Hai đường thẳng y = 2x + 1 và y = 2x - 3 có quan hệ như thế nào?',
    choices: [
      'Cắt nhau tại một điểm',
      'Song song với nhau',
      'Trùng nhau',
      'Vuông góc với nhau',
    ],
    correctAnswerIndex: 1,
    maxScore: 0.5,
    source: 'manual',
  },
  {
    id: 'q-4',
    assignmentId: 'assg-1',
    order: 4,
    type: 'mcq',
    prompt: 'Hệ số góc của đường thẳng y = -3x + 5 là:',
    choices: ['3', '-3', '5', '-5'],
    correctAnswerIndex: 1,
    maxScore: 0.5,
    source: 'ai',
  },
  {
    id: 'q-5',
    assignmentId: 'assg-1',
    order: 5,
    type: 'mcq',
    prompt: 'Đường thẳng y = x + 2 cắt trục Oy tại điểm có tọa độ là:',
    choices: ['(0, 2)', '(2, 0)', '(-2, 0)', '(0, -2)'],
    correctAnswerIndex: 0,
    maxScore: 0.5,
    source: 'manual',
  },
  {
    id: 'q-6',
    assignmentId: 'assg-1',
    order: 6,
    type: 'essay',
    prompt:
      'Cho hàm số y = 2x - 4.\n\na) Vẽ đồ thị hàm số trên mặt phẳng tọa độ Oxy.\n\nb) Tìm tọa độ giao điểm của đồ thị với trục Ox và trục Oy.\n\nc) Tính diện tích tam giác tạo bởi đồ thị hàm số với hai trục tọa độ.',
    maxScore: 3,
    source: 'manual',
  },
  {
    id: 'q-7',
    assignmentId: 'assg-1',
    order: 7,
    type: 'essay',
    prompt:
      'Tìm phương trình đường thẳng đi qua hai điểm A(1, 2) và B(3, 6). Giải thích các bước làm.',
    maxScore: 2,
    source: 'manual',
  },

  // Assignment 2: Bài tập về nhà Phương trình (class-8a)
  {
    id: 'q-8',
    assignmentId: 'assg-2',
    order: 1,
    type: 'mcq',
    prompt: 'Nghiệm của phương trình 2x + 6 = 0 là:',
    choices: ['x = 3', 'x = -3', 'x = 6', 'x = -6'],
    correctAnswerIndex: 1,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-9',
    assignmentId: 'assg-2',
    order: 2,
    type: 'mcq',
    prompt: 'Phương trình 3x - 9 = 0 có nghiệm là:',
    choices: ['x = 3', 'x = -3', 'x = 9', 'x = -9'],
    correctAnswerIndex: 0,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-10',
    assignmentId: 'assg-2',
    order: 3,
    type: 'mcq',
    prompt: 'Phương trình 5(x - 2) = 15 có nghiệm là:',
    choices: ['x = 1', 'x = 3', 'x = 5', 'x = 7'],
    correctAnswerIndex: 2,
    maxScore: 1,
    source: 'ai',
  },
  {
    id: 'q-11',
    assignmentId: 'assg-2',
    order: 4,
    type: 'mcq',
    prompt: 'Giải phương trình: 4x + 8 = 2x + 14',
    choices: ['x = 2', 'x = 3', 'x = 4', 'x = 6'],
    correctAnswerIndex: 1,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-12',
    assignmentId: 'assg-2',
    order: 5,
    type: 'mcq',
    prompt: 'Phương trình 0x = 0 có bao nhiêu nghiệm?',
    choices: ['Không có nghiệm', 'Có 1 nghiệm', 'Có 2 nghiệm', 'Vô số nghiệm'],
    correctAnswerIndex: 3,
    maxScore: 1,
    source: 'manual',
  },

  // Assignment 3: Kiểm tra nhanh Đồ thị (class-8b)
  {
    id: 'q-13',
    assignmentId: 'assg-3',
    order: 1,
    type: 'mcq',
    prompt: 'Để vẽ đồ thị hàm số y = ax + b, ta cần xác định ít nhất bao nhiêu điểm?',
    choices: ['1 điểm', '2 điểm', '3 điểm', '4 điểm'],
    correctAnswerIndex: 1,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-14',
    assignmentId: 'assg-3',
    order: 2,
    type: 'mcq',
    prompt: 'Đồ thị hàm số y = 3x đi qua gốc tọa độ O và điểm nào?',
    choices: ['(1, 3)', '(3, 1)', '(1, 1)', '(3, 3)'],
    correctAnswerIndex: 0,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-15',
    assignmentId: 'assg-3',
    order: 3,
    type: 'mcq',
    prompt: 'Tung độ gốc của đường thẳng y = -2x + 5 là:',
    choices: ['-2', '2', '5', '-5'],
    correctAnswerIndex: 2,
    maxScore: 1,
    source: 'ai',
  },
  {
    id: 'q-16',
    assignmentId: 'assg-3',
    order: 4,
    type: 'essay',
    prompt: 'Vẽ đồ thị hàm số y = -x + 3 và xác định các điểm cắt trục tọa độ.',
    maxScore: 2,
    source: 'manual',
  },

  // Assignment 4: Ôn tập cuối kỳ (class-9a) - Draft
  {
    id: 'q-17',
    assignmentId: 'assg-4',
    order: 1,
    type: 'mcq',
    prompt: 'Căn bậc hai số học của 16 là:',
    choices: ['4', '-4', '±4', '8'],
    correctAnswerIndex: 0,
    maxScore: 0.5,
    source: 'manual',
  },
  {
    id: 'q-18',
    assignmentId: 'assg-4',
    order: 2,
    type: 'mcq',
    prompt: 'Rút gọn biểu thức √50 được:',
    choices: ['5√2', '2√5', '10√5', '25√2'],
    correctAnswerIndex: 0,
    maxScore: 0.5,
    source: 'manual',
  },
  {
    id: 'q-19',
    assignmentId: 'assg-4',
    order: 3,
    type: 'essay',
    prompt: 'Rút gọn và tính giá trị của biểu thức P = √(x+2)² + |x-1| với x = -3.',
    maxScore: 2,
    source: 'manual',
  },
  {
    id: 'q-20',
    assignmentId: 'assg-4',
    order: 4,
    type: 'essay',
    prompt: 'Giải hệ phương trình:\n2x + y = 5\nx - y = 1',
    maxScore: 2,
    source: 'ai',
  },

  // Assignment 5: Bài tập Tam giác đồng dạng (class-8b) - Draft
  {
    id: 'q-21',
    assignmentId: 'assg-5',
    order: 1,
    type: 'mcq',
    prompt: 'Hai tam giác đồng dạng khi có:',
    choices: [
      'Ba cạnh tương ứng bằng nhau',
      'Ba góc tương ứng bằng nhau',
      'Ba cạnh tương ứng tỉ lệ',
      'Cả B và C đều đúng',
    ],
    correctAnswerIndex: 3,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-22',
    assignmentId: 'assg-5',
    order: 2,
    type: 'mcq',
    prompt:
      'Cho tam giác ABC đồng dạng với tam giác DEF theo tỉ số k = 2. Nếu AB = 6cm thì DE = ?',
    choices: ['3cm', '12cm', '6cm', '4cm'],
    correctAnswerIndex: 0,
    maxScore: 1,
    source: 'manual',
  },
  {
    id: 'q-23',
    assignmentId: 'assg-5',
    order: 3,
    type: 'essay',
    prompt:
      'Cho tam giác ABC có AB = 3cm, AC = 4cm, BC = 5cm. Tam giác DEF có DE = 6cm, EF = 8cm, DF = 10cm. Chứng minh tam giác ABC đồng dạng với tam giác DEF và tính tỉ số đồng dạng.',
    maxScore: 3,
    source: 'manual',
  },
];

// Counter for generating new IDs
let questionIdCounter = 24;

// Helper to generate new question ID
export function generateQuestionId(): string {
  return `q-${questionIdCounter++}`;
}

// Helper to get questions by assignment ID
export function getQuestionsByAssignmentId(assignmentId: string): Question[] {
  return mockQuestions
    .filter((q) => q.assignmentId === assignmentId)
    .sort((a, b) => a.order - b.order);
}

// Helper to add questions
export function addQuestions(questions: Question[]): void {
  mockQuestions.push(...questions);
}

// Helper to delete questions by assignment ID
export function deleteQuestionsByAssignmentId(assignmentId: string): void {
  mockQuestions = mockQuestions.filter((q) => q.assignmentId !== assignmentId);
}

// Helper to get total max score for an assignment
export function getMaxScoreByAssignmentId(assignmentId: string): number {
  return getQuestionsByAssignmentId(assignmentId).reduce((sum, q) => sum + q.maxScore, 0);
}
