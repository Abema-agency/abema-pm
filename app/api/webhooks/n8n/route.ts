import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const runtime = 'nodejs'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient<Database>(url, key)
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-n8n-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, projectId, data } = body as {
    event: string
    projectId?: string
    data?: Record<string, unknown>
  }

  const supabase = getServiceClient()

  if (event === 'status_report.generated' && projectId && data) {
    const ragRaw = data.rag_status as string
    const ragStatus: 'green' | 'amber' | 'red' =
      ragRaw === 'amber' || ragRaw === 'red' ? ragRaw : 'green'
    const { error } = await supabase.from('status_reports').insert({
      project_id: projectId,
      period_start: data.period_start as string,
      period_end: data.period_end as string,
      rag_status: ragStatus,
      headline: data.headline as string ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: (data.content ?? {}) as any,
      generated_by_ai: true,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ received: true, event })
}
