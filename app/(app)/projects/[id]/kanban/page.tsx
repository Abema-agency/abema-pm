import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { KanbanBoard } from '@/components/project/KanbanBoard'
import type { Project } from '@/types/project'

type Props = { params: Promise<{ id: string }> }

export default async function KanbanPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('name, approach, status')
    .eq('id', id)
    .single()

  return (
    <div>
      <AppHeader
        title="Kanban"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: project?.name ?? 'Projet', href: `/projects/${id}/kanban` },
          { label: 'Kanban' },
        ]}
      />
      <KanbanBoard projectId={id} />
    </div>
  )
}
