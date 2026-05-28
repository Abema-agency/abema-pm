import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const runtime = 'nodejs'

// Called by N8N WF5 to save the generated executive report for each org
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-n8n-secret')
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    projectId: string
    orgId: string
    periodStart: string
    periodEnd: string
    ragStatus: 'green' | 'amber' | 'red'
    headline: string
    content: Record<string, unknown>
    sentTo: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { projectId, periodStart, periodEnd, ragStatus, headline, content, sentTo } = body
  if (!projectId || !periodStart) {
    return NextResponse.json({ error: 'projectId et periodStart requis' }, { status: 400 })
  }

  // Use service role key — this route is server-to-server, no user session
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await supabase.from('status_reports').insert({
    project_id: projectId,
    period_start: periodStart,
    period_end: periodEnd ?? null,
    rag_status: ragStatus ?? null,
    headline: headline ?? null,
    content: (content as import('@/types/supabase').Json) ?? null,
    generated_by_ai: true,
    sent_to: sentTo ?? [],
    sent_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
