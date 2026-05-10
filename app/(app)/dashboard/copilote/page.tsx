import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { CopiloteIA } from '@/components/copilote/CopiloteIA'
import { CopiloteDashboard } from '@/components/copilote/CopiloteDashboard'
import type { CopiloteMetrics } from '@/types/copilote'

export default async function CopilotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Placeholder metrics — à remplacer par des vraies données Supabase
  const metrics: CopiloteMetrics = {
    aiMessagesUsed: 12,
    workflowsTriggered: 3,
    plan: 'starter',
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
