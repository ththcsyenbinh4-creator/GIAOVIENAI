/**
 * Voice Generation API
 *
 * POST /api/voice/generate
 * Generates audio from text
 *
 * NOTE: This feature is temporarily unavailable as we have migrated to Google Gemini API,
 * which does not currently support direct Text-to-Speech (TTS) generation in the same way.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Tính năng tạo giọng nói tạm thời không khả dụng do hệ thống đang chuyển đổi sang Google Gemini (chưa hỗ trợ TTS).',
      code: 'GEMINI_MIGRATION_NO_TTS'
    },
    { status: 503 }
  );
}
