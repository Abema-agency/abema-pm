import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { CopiloteIA } from '@/components/copilote/CopiloteIA'
import { CopiloteDashboard } from '@/components/copilote/CopiloteDashboard'
import type { CopiloteMetrics, Plan } from '@/types/copilote'

function resolvePlan(orgPlan: string | null | undefined): Plan {
  const normalized = (orgPlan ?? '').toLowerCase()
  if (normalized === 'solo') return 'solo'
  if (normalized === 'pro') return 'pro'
  if (normalized === 'team') return 'team'
  return 'lite'
}

export default async function CopilotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Resolve plan
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
  const plan = resolvePlan(orgPlan)

  // Count today's AI messages
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count: aiMessagesUsed } = await supabase
    .from('ai_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())

  // Count total workflow triggers (this month)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count: workflowsTriggered } = await supabase
    .from('ai_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('interaction_type', ['status_report', 'risk_alert'])
    .gte('created_at', monthStart.toISOString())

  const metrics: CopiloteMetrics = {
    aiMessagesUsed: aiMessagesUsed ?? 0,
    workflowsTriggered: workflowsTriggered ?? 0,
    plan,
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Copilote IA" />
      <div className="p-6 space-y-6 flex-1 min-h-0 overflow-auto">
        <CopiloteDashboard metrics={metrics} />
        <div className="h-[520px] border rounded-xl overflow-hidden bg-white">
          <CopiloteIA />
        </div>
      </div>
    </div>
  )
}
