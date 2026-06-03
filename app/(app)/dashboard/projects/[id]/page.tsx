import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { ProjectDetailClient } from '@/components/dashboard/ProjectDetailClient'
import { computeProjectMetrics } from '@/lib/dashboard/metrics'
import type { Project, WorkPackage, Risk } from '@/types/project'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const [{ data: workPackages }, { data: risks }] = await Promise.all([
    supabase.from('work_packages').select('*').eq('project_id', id),
    supabase.from('risks').select('*').eq('project_id', id),
  ])

  const metrics = computeProjectMetrics(
    project as Project,
    (workPackages ?? []) as WorkPackage[],
    (risks ?? []) as Risk[],
  )

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={project.name} />
      <ProjectDetailClient project={project as Project} metrics={metrics} />
    </div>
  )
}
