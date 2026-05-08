import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'

type Props = { params: Promise<{ id: string }> }

export default async function GanttPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: project } = await supabase.from('projects').select('name').eq('id', id).single()

  return (
    <div>
      <AppHeader
        title="Gantt"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: project?.name ?? 'Projet', href: `/projects/${id}/kanban` },
          { label: 'Gantt' },
        ]}
      />
      <div className="p-6 text-center py-16 text-slate-400">
        <p className="text-lg font-medium text-slate-600 mb-2">Vue Gantt — V2</p>
        <p className="text-sm">Le diagramme Gantt interactif sera disponible en V2.</p>
      </div>
    </div>
  )
}
