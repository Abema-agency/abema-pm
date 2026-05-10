import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { CopiloteIA } from '@/components/copilote/CopiloteIA'
import { WorkflowTriggers } from '@/components/copilote/WorkflowTriggers'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectCopilotePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, status')
    .eq('id', id)
    .single()

  if (!project) notFound()

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={`${project.name} — Copilote`} />
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Chat */}
        <div className="flex-1 min-h-0 border-r">
          <CopiloteIA projectId={project.id} />
        </div>

        {/* Sidebar workflows */}
        <div className="w-64 flex-shrink-0 p-4 bg-slate-50">
          <WorkflowTriggers projectId={project.id} />
        </div>
      </div>
    </div>
  )
}
