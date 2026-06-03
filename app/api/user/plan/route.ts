// app/api/user/plan/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Plan } from '@/types/copilote'

function resolvePlan(raw: string | null | undefined): Plan {
  const v = (raw ?? '').toLowerCase()
  if (v === 'solo') return 'solo'
  if (v === 'pro') return 'pro'
  if (v === 'team') return 'team'
  return 'lite'
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  let orgPlan: string | null = null
  let orgId: string | null = profile?.org_id ?? null

  if (orgId) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', orgId)
      .single()
    orgPlan = org?.plan ?? null
  }

  return NextResponse.json(
    { plan: resolvePlan(orgPlan), orgId },
    { headers: { 'Cache-Control': 'private, max-age=60' } }
  )
}
