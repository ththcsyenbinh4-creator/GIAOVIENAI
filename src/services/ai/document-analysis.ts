import { createCompletion, parseJSONResponse } from './client';
import { SYSTEM_PROMPTS, getDocumentAnalysisPrompt } from './prompts';
import {
  DocumentAnalysisRequest,
  DocumentAnalysisResult,
  SuggestedQuestion,
  StreamingOptions,
} from './types';

// Main document analysis function
export async function analyzeDocument(
  request: DocumentAnalysisRequest,
  streaming?: StreamingOptions
): Promise<DocumentAnalysisResult> {
  const startTime = Date.now();

  // Fetch document content (in production, this would parse the actual document)
  const documentContent = await fetchDocumentContent(request.documentUrl, request.documentType);

  const options = {
    extractKeyPoints: true,
    generateSummary: true,
    suggestQuestions: true,
    questionCount: 5,
    ...request.options,
  };

  const userPrompt = getDocumentAnalysisPrompt({
    documentContent,
    questionCount: options.questionCount,
  });

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.documentAnalysis,
    userPrompt,
    streaming,
  });

  const parsed = parseJSONResponse<{
    summary: string;
    objectives: string[];
    keyPoints: string[];
    suggestedQuestions: SuggestedQuestion[];
  }>(response);

  // Add IDs to suggested questions
  const suggestedQuestions = parsed.suggestedQuestions.map((q, index) => ({
    ...q,
    id: `suggested-${request.documentId}-${index + 1}`,
  }));

  return {
    documentId: request.documentId,
    summary: parsed.summary,
    objectives: parsed.objectives,
    keyPoints: parsed.keyPoints,
    suggestedQuestions,
    processingTime: Date.now() - startTime,
  };
}

// Fetch and parse document content
async function fetchDocumentContent(
  documentUrl: string,
  documentType: string
): Promise<string> {
  // In production, this would:
  // 1. Fetch the document from Supabase storage
  // 2. Parse the document based on type (PDF, DOCX, PPTX)
  // 3. Extract text content

  // For now, return mock content for demonstration
  return `
    Chương 3: Hàm số bậc nhất

    1. Định nghĩa hàm số bậc nhất
    Hàm số bậc nhất là hàm số có dạng y = ax + b, trong đó a và b là các số cho trước, a ≠ 0.
    - a được gọi là hệ số góc
    - b được gọi là tung độ gốc

    2. Đồ thị hàm số bậc nhất
    Đồ thị của hàm số y = ax + b là một đường thẳng:
    - Cắt trục tung tại điểm có tung độ b
    - Có hệ số góc a

    3. Tính chất
    - Nếu a > 0: đồ thị đi lên từ trái sang phải (hàm số đồng biến)
    - Nếu a < 0: đồ thị đi xuống từ trái sang phải (hàm số nghịch biến)

    4. Hai đường thẳng song song và cắt nhau
    - Hai đường thẳng y = ax + b và y = a'x + b' song song khi a = a' và b ≠ b'
    - Hai đường thẳng cắt nhau khi a ≠ a'
    - Hai đường thẳng trùng nhau khi a = a' và b = b'

    5. Cách vẽ đồ thị
    Bước 1: Tìm hai điểm thuộc đồ thị
    Bước 2: Vẽ đường thẳng đi qua hai điểm đó

    Bài tập áp dụng:
    - Xác định hệ số góc và tung độ gốc
    - Vẽ đồ thị hàm số
    - Tìm giao điểm với các trục tọa độ
    - Xác định vị trí tương đối của hai đường thẳng
  `;
}

// Quick summary for preview
export async function getQuickSummary(
  documentUrl: string,
  documentType: string
): Promise<string> {
  const documentContent = await fetchDocumentContent(documentUrl, documentType);

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.documentAnalysis,
    userPrompt: `Tóm tắt ngắn gọn (2-3 câu) nội dung chính của tài liệu sau:\n\n${documentContent}`,
    config: {
      maxTokens: 200,
      temperature: 0.5,
    },
  });

  return response;
}

// Extract questions only
export async function extractQuestionsFromDocument(
  documentUrl: string,
  documentType: string,
  questionCount: number = 10
): Promise<SuggestedQuestion[]> {
  const documentContent = await fetchDocumentContent(documentUrl, documentType);

  const response = await createCompletion({
    systemPrompt: SYSTEM_PROMPTS.documentAnalysis,
    userPrompt: `Dựa trên tài liệu sau, tạo ${questionCount} câu hỏi kiểm tra với các loại khác nhau (trắc nghiệm và tự luận).

TÀI LIỆU:
${documentContent}

Trả về dưới dạng JSON array với format:
[
  {
    "type": "single" | "multiple" | "essay",
    "content": "Nội dung câu hỏi",
    "difficulty": "easy" | "medium" | "hard",
    "points": number,
    "options": [...],
    "rubric": [...]
  }
]`,
  });

  const questions = parseJSONResponse<SuggestedQuestion[]>(response);

  return questions.map((q, index) => ({
    ...q,
    id: `extracted-${index + 1}`,
  }));
}
