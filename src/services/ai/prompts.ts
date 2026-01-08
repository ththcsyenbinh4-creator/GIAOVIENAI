// AI Prompts for various operations

export const SYSTEM_PROMPTS = {
  documentAnalysis: `Bạn là trợ lý AI chuyên phân tích tài liệu giáo dục cho giáo viên Việt Nam.
Nhiệm vụ của bạn là:
1. Tóm tắt nội dung chính của tài liệu
2. Xác định mục tiêu học tập
3. Trích xuất các điểm kiến thức quan trọng
4. Đề xuất câu hỏi kiểm tra phù hợp

Hãy trả lời bằng tiếng Việt, sử dụng ngôn ngữ phù hợp với ngữ cảnh giáo dục Việt Nam.`,

  questionGeneration: `Bạn là chuyên gia soạn đề thi cho giáo viên Việt Nam.
Nhiệm vụ của bạn là tạo các câu hỏi kiểm tra chất lượng cao dựa trên:
- Chủ đề và cấp độ lớp được yêu cầu
- Các loại câu hỏi: trắc nghiệm một đáp án, trắc nghiệm nhiều đáp án, tự luận
- Độ khó phù hợp với học sinh

Yêu cầu:
- Câu hỏi phải rõ ràng, không mơ hồ
- Đáp án nhiễu phải hợp lý
- Câu tự luận cần có rubric chấm điểm chi tiết
- Tuân thủ chương trình giáo dục Việt Nam`,

  essayGrading: `Bạn là giáo viên chấm bài tự luận với kinh nghiệm lâu năm.
Nhiệm vụ của bạn là:
1. Chấm điểm bài làm của học sinh dựa trên rubric
2. Đưa ra nhận xét chi tiết về điểm mạnh và điểm cần cải thiện
3. Gợi ý cách cải thiện cho học sinh

Nguyên tắc chấm điểm:
- Công bằng và nhất quán
- Xem xét cả nội dung và cách trình bày
- Khích lệ và xây dựng
- Phù hợp với trình độ học sinh`,

  contentModeration: `Bạn là hệ thống kiểm duyệt nội dung giáo dục.
Nhiệm vụ: Kiểm tra nội dung có phù hợp với môi trường giáo dục không.
Báo cáo các vấn đề về:
- Nội dung không phù hợp với học sinh
- Nội dung sai lệch về mặt khoa học
- Nội dung vi phạm bản quyền tiềm tàng`,
};

// Question Generation Prompts
export function getQuestionGenerationPrompt(params: {
  topic: string;
  gradeLevel: string;
  subject: string;
  questionCount: number;
  questionTypes: string[];
  difficulty: string;
  context?: string;
}): string {
  const { topic, gradeLevel, subject, questionCount, questionTypes, difficulty, context } = params;

  return `Hãy tạo ${questionCount} câu hỏi về chủ đề "${topic}" cho học sinh ${gradeLevel}.

Môn học: ${subject}
Loại câu hỏi cần tạo: ${questionTypes.join(', ')}
Độ khó: ${difficulty}
${context ? `Ngữ cảnh bổ sung: ${context}` : ''}

Yêu cầu output dưới dạng JSON với format sau:
{
  "questions": [
    {
      "type": "single" | "multiple" | "essay",
      "content": "Nội dung câu hỏi",
      "difficulty": "easy" | "medium" | "hard",
      "points": number,
      "options": [ // Chỉ cho trắc nghiệm
        { "id": "a", "content": "...", "isCorrect": true/false }
      ],
      "correctAnswerExplanation": "Giải thích đáp án đúng",
      "rubric": ["Tiêu chí 1: x điểm", ...], // Chỉ cho tự luận
      "bloomsLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"
    }
  ]
}`;
}

// Document Analysis Prompts
export function getDocumentAnalysisPrompt(params: {
  documentContent: string;
  questionCount?: number;
}): string {
  const { documentContent, questionCount = 5 } = params;

  return `Phân tích tài liệu giáo dục sau và trả về kết quả dưới dạng JSON:

TÀI LIỆU:
${documentContent}

Yêu cầu output JSON:
{
  "summary": "Tóm tắt nội dung chính (2-3 đoạn)",
  "objectives": ["Mục tiêu học tập 1", "Mục tiêu 2", ...],
  "keyPoints": ["Điểm kiến thức quan trọng 1", "Điểm 2", ...],
  "suggestedQuestions": [
    {
      "type": "single" | "multiple" | "essay",
      "content": "Nội dung câu hỏi",
      "difficulty": "easy" | "medium" | "hard",
      "points": number,
      "options": [...], // Nếu là trắc nghiệm
      "rubric": [...], // Nếu là tự luận
      "sourceSection": "Phần tài liệu liên quan"
    }
  ] // Tạo ${questionCount} câu hỏi đề xuất
}`;
}

// Essay Grading Prompts
export function getEssayGradingPrompt(params: {
  questionContent: string;
  studentAnswer: string;
  rubric: string[];
  maxPoints: number;
}): string {
  const { questionContent, studentAnswer, rubric, maxPoints } = params;

  return `Chấm bài tự luận của học sinh.

CÂU HỎI:
${questionContent}

RUBRIC CHẤM ĐIỂM (Tổng điểm: ${maxPoints}):
${rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}

BÀI LÀM CỦA HỌC SINH:
${studentAnswer}

Yêu cầu output JSON:
{
  "suggestedScore": number, // Điểm đề xuất (0 đến ${maxPoints})
  "confidence": number, // Độ tin cậy (0.0 đến 1.0)
  "feedback": {
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"],
    "overallComment": "Nhận xét tổng quát"
  },
  "rubricScores": [
    {
      "criterion": "Tiêu chí",
      "score": number,
      "maxScore": number,
      "comment": "Nhận xét chi tiết"
    }
  ]
}`;
}

// Content Moderation Prompts
export function getContentModerationPrompt(content: string, contentType: string): string {
  return `Kiểm tra nội dung ${contentType} sau đây có phù hợp với môi trường giáo dục không:

NỘI DUNG:
${content}

Yêu cầu output JSON:
{
  "isAppropriate": true/false,
  "flags": [
    {
      "type": "inappropriate" | "plagiarism" | "off-topic" | "low-quality",
      "severity": "low" | "medium" | "high",
      "description": "Mô tả vấn đề"
    }
  ],
  "suggestions": ["Gợi ý cải thiện 1", ...]
}`;
}
