// app/(app)/layout.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AICopilotPanel } from '@/components/ai/AICopilotPanel'
import { Toaster } from '@/components/ui/sonner'
import Providers from './providers'
import type { Plan } from '@/types/copilote'

function resolvePlan(raw: string | null | undefined): Plan {
  const v = (raw ?? '').toLowerCase()
  if (v === 'solo') return 'solo'
  if (v === 'pro') return 'pro'
  if (v === 'team') return 'team'
  return 'lite'
}

export default async function AppLayout({ children }: { children: ReactNode }) {
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

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AppSidebar plan={plan} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <AICopilotPanel />
        <Toaster />
      </div>
    </Providers>
  )
}
