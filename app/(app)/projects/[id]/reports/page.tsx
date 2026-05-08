import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'

type Props = { params: Promise<{ id: string }> }

export default async function ReportsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: project } = await supabase.from('projects').select('name').eq('id', id).single()

  return (
    <div>
      <AppHeader
        title="Rapports"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: project?.name ?? 'Projet', href: `/projects/${id}/kanban` },
          { label: 'Rapports' },
        ]}
      />
      <div className="p-6">
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium text-slate-600 mb-2">Rapports de statut — V2</p>
          <p className="text-sm">La génération automatique de status reports IA arrive en V2.</p>
          <p className="text-sm mt-1">Utilisez le Copilote IA → "Génère un status report" pour un rapport immédiat.</p>
        </div>
      </div>
    </div>
  )
}
