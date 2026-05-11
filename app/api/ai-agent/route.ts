import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, AI_MODEL } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/prompts/system'
import type { AiAgentRequest } from '@/types/copilote'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: AiAgentRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { messages, projectId } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
  }

  let projectContext: Parameters<typeof buildSystemPrompt>[0]

  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('name, sector, approach')
      .eq('id', projectId)
      .single()

    if (project) {
      projectContext = {
        name: project.name,
        sector: project.sector ?? 'non précisé',
        approach: project.approach,
        currentPhase: 'Execution',
      }
    }
  }

  const systemPrompt = buildSystemPrompt(projectContext)
  const anthropic = getAnthropicClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stream: any
  try {
    stream = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      stream: true,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Anthropic error'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Fire-and-forget interaction log
  void supabase.from('ai_interactions').insert({
    project_id: projectId ?? null,
    user_id: user.id,
    interaction_type: 'chat',
    prompt_preview: messages[messages.length - 1]?.content?.slice(0, 100) ?? '',
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
