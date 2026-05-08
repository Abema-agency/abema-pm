import Anthropic from '@anthropic-ai/sdk'

export const AI_MODEL = 'claude-sonnet-4-6'

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}
