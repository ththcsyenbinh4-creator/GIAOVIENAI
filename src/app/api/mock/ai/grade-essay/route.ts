import { NextRequest, NextResponse } from 'next/server';
import { GradeEssayRequest, GradeEssayResponse } from '@/types/domain';
import OpenAI from 'openai';

// Initialize OpenAI client
const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined');
  }
  return new OpenAI({
    apiKey: apiKey,
  });
};

/**
 * POST /api/mock/ai/grade-essay
 *
 * AI endpoint for grading essay answers using OpenAI.
 * Falls back to heuristic-based grading if API is unavailable.
 *
 * Body: GradeEssayRequest
 * {
 *   answerText: string,
 *   questionPrompt?: string,
 *   maxScore: number,
 *   rubric?: string (optional grading rubric)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: GradeEssayRequest = await request.json();

    // Validate request
    if (!body.answerText) {
      return NextResponse.json(
        { success: false, error: 'answerText is required' },
        { status: 400 }
      );
    }

    if (typeof body.maxScore !== 'number' || body.maxScore <= 0) {
      return NextResponse.json(
        { success: false, error: 'maxScore must be a positive number' },
        { status: 400 }
      );
    }

    // Check if real AI is enabled and OpenAI API key is configured
    const useRealAI = process.env.USE_REAL_AI === 'true';

    if (!useRealAI || !process.env.OPENAI_API_KEY) {
      if (!useRealAI) {
        console.log('USE_REAL_AI=false, using heuristic grading');
      } else {
        console.warn('OpenAI API key not configured, falling back to heuristic grading');
      }
      const result = gradeEssayMock(body.answerText, body.maxScore, body.questionPrompt);
      return NextResponse.json({
        success: true,
        data: { ...result, source: 'heuristic' },
      });
    }

    // Grade essay using OpenAI
    const result = await gradeEssayWithOpenAI(
      body.answerText,
      body.maxScore,
      body.questionPrompt,
      (body as GradeEssayRequest & { rubric?: string }).rubric
    );

    return NextResponse.json({
      success: true,
      data: { ...result, source: 'openai' },
    });
  } catch (error) {
    console.error('Error grading essay:', error);

    // If OpenAI fails, fall back to heuristic grading
    try {
      const body: GradeEssayRequest = await request.clone().json();
      const result = gradeEssayMock(
        body.answerText || '',
        body.maxScore || 10,
        body.questionPrompt
      );
      return NextResponse.json({
        success: true,
        data: { ...result, source: 'heuristic-fallback' },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Failed to grade essay' },
        { status: 500 }
      );
    }
  }
}

/**
 * Grade essay using OpenAI API
 */
async function gradeEssayWithOpenAI(
  answerText: string,
  maxScore: number,
  questionPrompt?: string,
  rubric?: string
): Promise<GradeEssayResponse> {
  const systemPrompt = `Bạn là một giáo viên giàu kinh nghiệm, chuyên chấm bài tự luận cho học sinh Việt Nam.
Bạn chấm điểm công bằng, chi tiết và đưa ra phản hồi mang tính xây dựng.
Luôn trả về JSON hợp lệ theo format yêu cầu.`;

  const questionContext = questionPrompt
    ? `Câu hỏi: "${questionPrompt}"\n\n`
    : '';

  const rubricContext = rubric
    ? `Rubric chấm điểm:\n${rubric}\n\n`
    : '';

  const userPrompt = `${questionContext}${rubricContext}Bài làm của học sinh:
"""
${answerText}
"""

Chấm bài với thang điểm tối đa ${maxScore} điểm.

Yêu cầu:
- Đánh giá nội dung, cấu trúc, và cách trình bày
- Cho điểm công bằng dựa trên chất lượng bài làm
- Liệt kê các điểm mạnh (ít nhất 1, tối đa 4)
- Liệt kê các điểm cần cải thiện (ít nhất 1, tối đa 4)
- Viết nhận xét tổng quát ngắn gọn (2-3 câu)

Trả về JSON với format sau (KHÔNG có text khác ngoài JSON):
{
  "suggestedScore": <số điểm từ 0 đến ${maxScore}>,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"],
  "comment": "Nhận xét tổng quát về bài làm"
}`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Lower temperature for more consistent grading
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content || '{}';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    suggestedScore: number;
    strengths: string[];
    improvements: string[];
    comment: string;
  };

  // Validate and clamp score
  const suggestedScore = Math.max(0, Math.min(maxScore, parsed.suggestedScore));

  return {
    suggestedScore: Math.round(suggestedScore * 10) / 10,
    strengths: parsed.strengths || ['Đã hoàn thành bài làm'],
    improvements: parsed.improvements || ['Cần cải thiện thêm'],
    comment: parsed.comment || 'Đã chấm xong bài làm.',
  };
}

/**
 * Mock essay grading using simple heuristics.
 * This simulates what an AI would return.
 */
function gradeEssayMock(
  answerText: string,
  maxScore: number,
  questionPrompt?: string
): GradeEssayResponse {
  const text = answerText.trim();
  const textLength = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasLineBreaks = text.includes('\n');
  const hasMathSymbols = /[=+\-×÷√∑∫]|[a-z]\s*=|x\s*=|y\s*=/i.test(text);
  const hasSteps = /bước|step|1\.|2\.|a\)|b\)|thứ nhất|thứ hai|đầu tiên|tiếp theo/i.test(text);
  const hasConclusion = /vậy|kết luận|do đó|nên|suy ra|kết quả/i.test(text);
  const hasExplanation = /vì|bởi vì|do|tại vì|giải thích/i.test(text);

  // Calculate base score based on content quality
  let scorePercent = 0;

  // Length factor (30% weight)
  if (textLength < 50) {
    scorePercent += 0.1;
  } else if (textLength < 150) {
    scorePercent += 0.2;
  } else if (textLength < 300) {
    scorePercent += 0.25;
  } else {
    scorePercent += 0.3;
  }

  // Structure factor (25% weight)
  if (hasLineBreaks) scorePercent += 0.1;
  if (hasSteps) scorePercent += 0.15;

  // Content quality (30% weight)
  if (hasMathSymbols) scorePercent += 0.15;
  if (hasExplanation) scorePercent += 0.15;

  // Conclusion (15% weight)
  if (hasConclusion) scorePercent += 0.15;

  // Add some randomness (±10%)
  scorePercent += (Math.random() - 0.5) * 0.1;

  // Clamp between 0 and 1
  scorePercent = Math.max(0, Math.min(1, scorePercent));

  // Calculate actual score
  const suggestedScore = Math.round(scorePercent * maxScore * 10) / 10;

  // Generate feedback based on analysis
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Strengths
  if (textLength >= 150) {
    strengths.push('Bài làm có độ dài phù hợp');
  }
  if (hasSteps) {
    strengths.push('Trình bày có các bước rõ ràng');
  }
  if (hasMathSymbols) {
    strengths.push('Sử dụng ký hiệu toán học đúng cách');
  }
  if (hasExplanation) {
    strengths.push('Có giải thích quá trình suy luận');
  }
  if (hasConclusion) {
    strengths.push('Có kết luận rõ ràng');
  }
  if (hasLineBreaks) {
    strengths.push('Trình bày có cấu trúc');
  }

  // If no strengths found, add a generic one
  if (strengths.length === 0) {
    strengths.push('Đã hoàn thành bài làm');
  }

  // Improvements
  if (textLength < 100) {
    improvements.push('Cần viết chi tiết hơn');
  }
  if (!hasSteps) {
    improvements.push('Nên trình bày theo các bước cụ thể');
  }
  if (!hasMathSymbols && questionPrompt?.toLowerCase().includes('tính')) {
    improvements.push('Cần có các phép tính và công thức');
  }
  if (!hasExplanation) {
    improvements.push('Cần giải thích rõ hơn quá trình làm bài');
  }
  if (!hasConclusion) {
    improvements.push('Thiếu kết luận cuối bài');
  }
  if (!hasLineBreaks && textLength > 100) {
    improvements.push('Nên chia đoạn để dễ đọc hơn');
  }

  // Generate overall comment
  let comment: string;
  if (scorePercent >= 0.8) {
    comment =
      'Bài làm tốt! Học sinh thể hiện sự hiểu biết rõ ràng về vấn đề và trình bày logic, mạch lạc.';
  } else if (scorePercent >= 0.6) {
    comment =
      'Bài làm khá tốt. Học sinh nắm được ý chính nhưng cần cải thiện một số điểm về trình bày và giải thích.';
  } else if (scorePercent >= 0.4) {
    comment =
      'Bài làm ở mức trung bình. Học sinh cần ôn lại kiến thức và chú ý trình bày đầy đủ các bước giải.';
  } else if (scorePercent >= 0.2) {
    comment =
      'Bài làm cần cải thiện nhiều. Học sinh nên xem lại cách giải và trình bày chi tiết hơn.';
  } else {
    comment =
      'Bài làm quá sơ sài. Học sinh cần làm lại với nội dung đầy đủ và chi tiết hơn.';
  }

  return {
    suggestedScore,
    strengths,
    improvements,
    comment,
  };
}
