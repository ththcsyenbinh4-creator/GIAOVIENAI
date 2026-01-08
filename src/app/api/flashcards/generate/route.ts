/**
 * Flashcard Generation API
 *
 * POST /api/flashcards/generate
 * Generates flashcards from lesson content using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  FlashcardGenerateRequest,
  FlashcardDeck,
  Flashcard,
  FlashcardDifficulty,
} from '@/types/domain';

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

// Maximum content length
const MAX_CONTENT_LENGTH = 6000;

// Flashcard generation system prompt
const SYSTEM_PROMPT = `Bạn là một chuyên gia tạo flashcard học tập cho học sinh Việt Nam.
Nhiệm vụ của bạn là tạo bộ flashcard từ nội dung bài học được cung cấp.

QUY TẮC TẠO FLASHCARD:
1. Mỗi flashcard có MẶT TRƯỚC (câu hỏi/thuật ngữ) và MẶT SAU (câu trả lời/định nghĩa)
2. Câu hỏi ngắn gọn, rõ ràng, tập trung vào 1 khái niệm
3. Câu trả lời súc tích nhưng đầy đủ
4. Thêm gợi ý (hint) cho các flashcard khó
5. Phân loại độ khó: easy (dễ), medium (trung bình), hard (khó)
6. Nhóm flashcard theo chủ đề (category) nếu có thể

LOẠI FLASHCARD NÊN TẠO:
- Định nghĩa thuật ngữ
- Công thức và cách áp dụng
- Sự kiện lịch sử, ngày tháng
- Quan hệ nhân quả
- So sánh, phân biệt
- Ví dụ và giải thích

OUTPUT FORMAT:
Trả về JSON với cấu trúc FlashcardDeck. Không thêm markdown code block, chỉ JSON thuần.`;

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Tính năng tạo flashcard chưa được cấu hình. Vui lòng liên hệ quản trị viên.' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: FlashcardGenerateRequest = await request.json();
    const {
      mode,
      title,
      gradeLevel,
      subject,
      content,
      targetCardCount = 15,
      difficulty = 'mixed',
    } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên bộ flashcard' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Không có nội dung để tạo flashcard' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Nội dung quá dài. Tối đa ${MAX_CONTENT_LENGTH} ký tự.` },
        { status: 400 }
      );
    }

    // Validate card count
    const cardCount = Math.max(5, Math.min(30, targetCardCount));

    // Build user prompt
    const userPrompt = buildUserPrompt({
      mode,
      title,
      gradeLevel,
      subject,
      content,
      cardCount,
      difficulty,
    });

    // Call OpenAI
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: 'Không nhận được phản hồi từ AI' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsedDeck: FlashcardDeck;
    try {
      const parsed = JSON.parse(responseText);
      parsedDeck = normalizeFlashcardDeck(parsed, title, gradeLevel, subject);
    } catch {
      console.error('Failed to parse flashcard JSON:', responseText);
      return NextResponse.json(
        { error: 'Không thể xử lý kết quả từ AI. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ deck: parsedDeck });
  } catch (error) {
    console.error('Flashcard generation error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Lỗi xác thực OpenAI API. Vui lòng kiểm tra API key.' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Không thể tạo flashcard. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

/**
 * Build user prompt for flashcard generation
 */
function buildUserPrompt(params: {
  mode: string;
  title: string;
  gradeLevel?: string;
  subject?: string;
  content: string;
  cardCount: number;
  difficulty: string;
}): string {
  const { mode, title, gradeLevel, subject, content, cardCount, difficulty } = params;

  let modeDescription = 'nội dung bài học';
  if (mode === 'from-lesson-plan') {
    modeDescription = 'kế hoạch bài giảng';
  } else if (mode === 'from-study-guide') {
    modeDescription = 'tài liệu ôn tập';
  }

  let contextInfo = `Tên bộ flashcard: ${title}`;
  if (gradeLevel) contextInfo += `\nKhối lớp: ${gradeLevel}`;
  if (subject) contextInfo += `\nMôn học: ${subject}`;

  let difficultyInstruction = '';
  if (difficulty === 'easy') {
    difficultyInstruction = 'Tất cả flashcard ở mức dễ (khái niệm cơ bản, định nghĩa đơn giản)';
  } else if (difficulty === 'medium') {
    difficultyInstruction = 'Tất cả flashcard ở mức trung bình (cần hiểu và vận dụng)';
  } else if (difficulty === 'hard') {
    difficultyInstruction = 'Tất cả flashcard ở mức khó (phân tích, so sánh, ứng dụng nâng cao)';
  } else {
    difficultyInstruction = 'Pha trộn các mức độ khó: 40% dễ, 40% trung bình, 20% khó';
  }

  return `Tạo bộ flashcard học tập từ ${modeDescription} sau:

${contextInfo}

NỘI DUNG:
${content}

YÊU CẦU:
- Tạo khoảng ${cardCount} flashcards
- ${difficultyInstruction}
- Mỗi flashcard có front (câu hỏi) và back (câu trả lời)
- Thêm hint cho các flashcard khó
- Phân loại theo category nếu nội dung có nhiều chủ đề
- Sử dụng ngôn ngữ phù hợp với học sinh${gradeLevel ? ` lớp ${gradeLevel}` : ''}

Trả về JSON với cấu trúc:
{
  "cards": [
    {
      "id": "card-1",
      "front": "Câu hỏi/thuật ngữ",
      "back": "Câu trả lời/định nghĩa",
      "hint": "Gợi ý (optional)",
      "category": "Chủ đề (optional)",
      "difficulty": "easy|medium|hard"
    }
  ],
  "description": "Mô tả ngắn về bộ flashcard"
}`;
}

/**
 * Normalize and validate flashcard deck from AI response
 */
function normalizeFlashcardDeck(
  parsed: Record<string, unknown>,
  title: string,
  gradeLevel?: string,
  subject?: string
): FlashcardDeck {
  const cards: Flashcard[] = [];
  const deck = parsed.deck as Record<string, unknown> | undefined;
  const rawCards = (parsed.cards || deck?.cards || []) as Record<string, unknown>[];

  for (let i = 0; i < rawCards.length; i++) {
    const rawCard = rawCards[i];

    // Skip invalid cards
    if (!rawCard.front || !rawCard.back) continue;

    const difficulty = validateDifficulty(rawCard.difficulty as string);

    const card: Flashcard = {
      id: (rawCard.id as string) || `card-${i + 1}`,
      front: String(rawCard.front),
      back: String(rawCard.back),
      hint: rawCard.hint ? String(rawCard.hint) : undefined,
      category: rawCard.category ? String(rawCard.category) : undefined,
      difficulty,
    };
    cards.push(card);
  }

  return {
    id: `flashcard-deck-${Date.now()}`,
    title,
    description: parsed.description ? String(parsed.description) : undefined,
    subject,
    gradeLevel,
    cards,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate and normalize difficulty
 */
function validateDifficulty(difficulty: string | undefined): FlashcardDifficulty {
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    return difficulty;
  }
  return 'medium';
}
