import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { StakeholdersClient } from './client'

type Props = { params: Promise<{ id: string }> }

export default async function StakeholdersPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase.from('projects').select('name').eq('id', id).single()

  return (
    <div>
      <AppHeader
        title="Parties prenantes"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: project?.name ?? 'Projet', href: `/projects/${id}/kanban` },
          { label: 'Parties prenantes' },
        ]}
      />
      <StakeholdersClient projectId={id} />
    </div>
  )
}
