import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const n8nUrl = process.env.N8N_WEBHOOK_STATUS_REPORT_URL
  if (!n8nUrl) {
    return NextResponse.json(
      { success: false, error: 'Workflow non configuré (N8N_WEBHOOK_STATUS_REPORT_URL manquant)' },
      { status: 503 },
    )
  }

  let body: { projectId: string; data?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { projectId } = body
  if (!projectId) {
    return NextResponse.json({ error: 'projectId requis' }, { status: 400 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
  }

  try {
    const n8nRes = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': process.env.N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify({
        event: 'status_report.trigger',
        projectId,
        userId: user.id,
        data: body.data,
      }),
    })

    if (!n8nRes.ok) {
      return NextResponse.json({ success: false, error: 'Erreur workflow N8N' }, { status: 502 })
    }

    return NextResponse.json({ success: true, message: 'Rapport de statut déclenché' })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Impossible de joindre le workflow N8N' },
      { status: 502 },
    )
  }
}
