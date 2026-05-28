import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/prompts/system'
import { PLAN_LIMITS } from '@/types/copilote'
import type { AiAgentRequest, Plan } from '@/types/copilote'

export const runtime = 'nodejs'

function getPlan(orgPlan: string | undefined | null): Plan {
  const normalized = (orgPlan ?? '').toLowerCase()
  if (normalized === 'solo') return 'solo'
  if (normalized === 'pro') return 'pro'
  if (normalized === 'team') return 'team'
  return 'lite'
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resolve user plan via org
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  let orgPlan: string | null = null
  if (profile?.org_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', profile.org_id)
      .single()
    orgPlan = org?.plan ?? null
  }

  const plan = getPlan(orgPlan)
  const limits = PLAN_LIMITS[plan]

  // Daily request limit check
  if (limits.dailyRequests !== -1) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('ai_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())

    if ((count ?? 0) >= limits.dailyRequests) {
      return NextResponse.json(
        {
          error: `Limite journalière atteinte (${limits.dailyRequests} req/jour sur plan ${plan}). Passez au plan supérieur pour continuer.`,
          limitReached: true,
          plan,
          dailyLimit: limits.dailyRequests,
        },
        { status: 429 }
      )
    }
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
      model: limits.model,
      max_tokens: limits.maxTokensPerRequest,
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

  // Log interaction (fire-and-forget)
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
      'X-Plan': plan,
    },
  })
}
