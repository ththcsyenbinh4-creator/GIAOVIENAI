import { AIConfig } from './types';

// Default AI configurations
export const defaultOpenAIConfig: AIConfig = {
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY || '',
  maxTokens: 4096,
  temperature: 0.7,
};

export const defaultAnthropicConfig: AIConfig = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  maxTokens: 4096,
  temperature: 0.7,
};

// Get active AI configuration
export function getAIConfig(): AIConfig {
  const provider = process.env.AI_PROVIDER || 'openai';

  if (provider === 'anthropic') {
    return defaultAnthropicConfig;
  }

  return defaultOpenAIConfig;
}

// Validate API key is present
export function validateConfig(config: AIConfig): boolean {
  if (!config.apiKey) {
    console.error(`Missing API key for ${config.provider}`);
    return false;
  }
  return true;
}

// Rate limiting configuration
export const rateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxTokensPerMinute: 100000,
  retryAttempts: 3,
  retryDelay: 1000, // ms
};

// Model-specific configurations
export const modelConfigs = {
  'gpt-4o': {
    maxContextTokens: 128000,
    costPer1kInputTokens: 0.005,
    costPer1kOutputTokens: 0.015,
  },
  'gpt-4o-mini': {
    maxContextTokens: 128000,
    costPer1kInputTokens: 0.00015,
    costPer1kOutputTokens: 0.0006,
  },
  'claude-sonnet-4-20250514': {
    maxContextTokens: 200000,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
  },
  'claude-3-haiku-20240307': {
    maxContextTokens: 200000,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
  },
};
