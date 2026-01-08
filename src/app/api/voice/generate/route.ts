/**
 * Voice Generation API
 *
 * POST /api/voice/generate
 * Generates audio from text using OpenAI TTS
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  VoiceGenerateRequest,
  VoiceGenerateResponse,
  VoiceMode,
  VoiceProfile,
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

// Maximum text length (approximately 4000 characters = ~3 minutes of audio)
const MAX_TEXT_LENGTH = 4000;

// Map voice profiles to OpenAI TTS voices
// OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
const voiceMap: Record<VoiceProfile, string> = {
  'teacher-default': 'nova',   // Warm, engaging voice
  'teacher-female': 'nova',    // Female voice
  'teacher-male': 'onyx',      // Male voice
};

// Vietnamese-friendly system instructions for different modes
const modeInstructions: Record<VoiceMode, string> = {
  'lesson-summary': 'Bạn đang đọc bản tóm tắt bài học cho học sinh. Đọc rõ ràng, chậm rãi và nhấn mạnh các khái niệm quan trọng.',
  'study-guide': 'Bạn đang đọc hướng dẫn ôn tập cho học sinh. Đọc từ tốn để học sinh có thể ghi chép.',
  'answer-explanation': 'Bạn đang giải thích đáp án cho học sinh. Giải thích rõ ràng, dễ hiểu.',
};

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Tính năng Voice chưa được cấu hình. Vui lòng liên hệ quản trị viên.' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: VoiceGenerateRequest = await request.json();
    const {
      mode,
      text,
      language = 'vi',
      voiceProfile = 'teacher-default',
      speed = 1.0,
    } = body;

    // Validate required fields
    if (!mode) {
      return NextResponse.json(
        { error: 'Vui lòng chọn chế độ tạo audio' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Không có nội dung để tạo audio' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Nội dung quá dài. Tối đa ${MAX_TEXT_LENGTH} ký tự.` },
        { status: 400 }
      );
    }

    // Validate speed (OpenAI TTS supports 0.25 to 4.0)
    const validSpeed = Math.max(0.25, Math.min(4.0, speed));

    // Get OpenAI voice for the profile
    const voice = voiceMap[voiceProfile] || 'nova';

    // Prepare text for TTS
    // Add context instruction for better Vietnamese pronunciation
    const processedText = prepareTextForTTS(text, mode, language);

    // Call OpenAI TTS API
    const openai = getOpenAI();
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',           // Use tts-1 for faster generation, tts-1-hd for higher quality
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: processedText,
      speed: validSpeed,
      response_format: 'mp3',
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // Convert to base64 data URL
    const base64Audio = buffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    // Estimate duration (rough: ~150 words per minute at speed 1.0)
    const wordCount = processedText.split(/\s+/).length;
    const estimatedDuration = Math.round((wordCount / 150) * 60 / validSpeed);

    const response: VoiceGenerateResponse = {
      audioUrl,
      durationSeconds: estimatedDuration,
      mode,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Voice generation error:', error);

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
      { error: 'Không thể tạo audio. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

/**
 * Prepare text for TTS
 * - Clean up formatting
 * - Add pauses for better rhythm
 * - Handle Vietnamese-specific formatting
 */
function prepareTextForTTS(text: string, mode: VoiceMode, language: string): string {
  let processed = text;

  // Remove excessive whitespace
  processed = processed.replace(/\s+/g, ' ').trim();

  // Add natural pauses after punctuation
  processed = processed.replace(/\./g, '. ');
  processed = processed.replace(/,/g, ', ');
  processed = processed.replace(/:/g, ': ');

  // Handle bullet points and numbered lists
  processed = processed.replace(/^[-•*]\s*/gm, '... ');
  processed = processed.replace(/^\d+\.\s*/gm, '... ');

  // Add intro based on mode (optional, for context)
  // Commented out to keep audio concise
  // const intro = modeInstructions[mode];

  return processed;
}
