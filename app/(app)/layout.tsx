import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AICopilotPanel } from '@/components/ai/AICopilotPanel'
import { Toaster } from '@/components/ui/sonner'
import Providers from './providers'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AppSidebar />
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
