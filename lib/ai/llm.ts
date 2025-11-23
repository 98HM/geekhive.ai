import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'
import { readFileSync } from 'fs'
import { join } from 'path'

const aiProvider = process.env.AI_PROVIDER || 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

/**
 * Load a prompt from the prompts folder
 */
export function loadPrompt(version: string, name: string): string {
  try {
    const promptPath = join(process.cwd(), 'prompts', 'versioned', version, `${name}.txt`)
    return readFileSync(promptPath, 'utf-8')
  } catch (error) {
    console.error(`Error loading prompt ${name} v${version}:`, error)
    throw new Error(`Prompt ${name} v${version} not found`)
  }
}

/**
 * Call LLM with a prompt
 */
export async function callLLM(
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
): Promise<string> {
  const temperature = options?.temperature ?? 0.7
  const maxTokens = options?.maxTokens ?? 2000

  try {
    switch (aiProvider) {
      case 'openai':
        if (!openai) throw new Error('OpenAI API key not configured')
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // or gpt-4o for better quality
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        })
        return openaiResponse.choices[0]?.message?.content || ''

      case 'anthropic':
        if (!anthropic) throw new Error('Anthropic API key not configured')
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        })
        return anthropicResponse.content[0].type === 'text'
          ? anthropicResponse.content[0].text
          : ''

      case 'groq':
        if (!groq) throw new Error('Groq API key not configured')
        const groqResponse = await groq.chat.completions.create({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        })
        return groqResponse.choices[0]?.message?.content || ''

      default:
        throw new Error(`Unknown AI provider: ${aiProvider}`)
    }
  } catch (error) {
    console.error('Error calling LLM:', error)
    throw new Error('Failed to call LLM')
  }
}

/**
 * Stream LLM response
 */
export async function* streamLLM(
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): AsyncGenerator<string, void, unknown> {
  const temperature = options?.temperature ?? 0.7
  const maxTokens = options?.maxTokens ?? 2000

  try {
    switch (aiProvider) {
      case 'openai':
        if (!openai) throw new Error('OpenAI API key not configured')
        const stream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
          stream: true,
        })
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) yield content
        }
        break

      case 'anthropic':
        if (!anthropic) throw new Error('Anthropic API key not configured')
        const anthropicStream = await anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        })
        for await (const chunk of anthropicStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            yield chunk.delta.text
          }
        }
        break

      case 'groq':
        if (!groq) throw new Error('Groq API key not configured')
        const groqStream = await groq.chat.completions.create({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
          stream: true,
        })
        for await (const chunk of groqStream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) yield content
        }
        break

      default:
        throw new Error(`Unknown AI provider: ${aiProvider}`)
    }
  } catch (error) {
    console.error('Error streaming LLM:', error)
    throw new Error('Failed to stream LLM')
  }
}

