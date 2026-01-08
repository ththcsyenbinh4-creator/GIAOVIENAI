import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIConfig, AIServiceError, StreamingOptions } from './types';
import { getAIConfig, validateConfig, rateLimitConfig } from './config';

// AI Client singleton
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

// Initialize OpenAI client
function getOpenAIClient(apiKey?: string): OpenAI {
  if (!openaiClient || apiKey) {
    openaiClient = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Initialize Anthropic client
function getAnthropicClient(apiKey?: string): Anthropic {
  if (!anthropicClient || apiKey) {
    anthropicClient = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

// Rate limiter
class RateLimiter {
  private requests: number[] = [];
  private tokens: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old entries
    this.requests = this.requests.filter((t) => t > oneMinuteAgo);

    return this.requests.length < rateLimitConfig.maxRequestsPerMinute;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  recordTokens(count: number): void {
    this.tokens.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

// Retry with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = rateLimitConfig.retryAttempts
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (isRetryableError(error)) {
        const delay = rateLimitConfig.retryDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('timeout') ||
      message.includes('503') ||
      message.includes('429')
    );
  }
  return false;
}

// Main completion function
export async function createCompletion(params: {
  systemPrompt: string;
  userPrompt: string;
  config?: Partial<AIConfig>;
  streaming?: StreamingOptions;
}): Promise<string> {
  const { systemPrompt, userPrompt, config: overrideConfig, streaming } = params;
  const config = { ...getAIConfig(), ...overrideConfig };

  if (!validateConfig(config)) {
    throw new Error('Invalid AI configuration');
  }

  if (!rateLimiter.canMakeRequest()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  rateLimiter.recordRequest();

  return withRetry(async () => {
    if (config.provider === 'openai') {
      return createOpenAICompletion(systemPrompt, userPrompt, config, streaming);
    } else {
      return createAnthropicCompletion(systemPrompt, userPrompt, config, streaming);
    }
  });
}

// OpenAI completion
async function createOpenAICompletion(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig,
  streaming?: StreamingOptions
): Promise<string> {
  const client = getOpenAIClient(config.apiKey);

  if (streaming?.onToken) {
    // Streaming response
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      fullContent += token;
      streaming.onToken(token);
    }

    streaming.onComplete?.(fullContent);
    return fullContent;
  } else {
    // Non-streaming response
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });

    return response.choices[0]?.message?.content || '';
  }
}

// Anthropic completion
async function createAnthropicCompletion(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig,
  streaming?: StreamingOptions
): Promise<string> {
  const client = getAnthropicClient(config.apiKey);

  if (streaming?.onToken) {
    // Streaming response
    const stream = await client.messages.stream({
      model: config.model,
      max_tokens: config.maxTokens || 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let fullContent = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const token = event.delta.text;
        fullContent += token;
        streaming.onToken(token);
      }
    }

    streaming.onComplete?.(fullContent);
    return fullContent;
  } else {
    // Non-streaming response
    const response = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens || 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.type === 'text' ? textBlock.text : '';
  }
}

// Parse JSON response safely
export function parseJSONResponse<T>(response: string): T {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${(error as Error).message}`);
  }
}

// Create AI service error
export function createAIError(
  code: string,
  message: string,
  retryable = false,
  details?: Record<string, unknown>
): AIServiceError {
  return {
    code,
    message,
    retryable,
    details,
  };
}
