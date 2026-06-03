// app/(app)/dashboard/copilote/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { CopilotePageClient } from '@/components/copilote/CopilotePageClient'
import type { Plan } from '@/types/copilote'

function resolvePlan(raw: string | null | undefined): Plan {
  const v = (raw ?? '').toLowerCase()
  if (v === 'solo') return 'solo'
  if (v === 'pro') return 'pro'
  if (v === 'team') return 'team'
  return 'lite'
}

export default async function CopilotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  let plan: Plan = 'lite'
  if (profile?.org_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', profile.org_id)
      .single()
    plan = resolvePlan(org?.plan)
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: dailyUsed } = await supabase
    .from('ai_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Copilote IA" />
      <CopilotePageClient plan={plan} dailyUsed={dailyUsed ?? 0} />
    </div>
  )
}
