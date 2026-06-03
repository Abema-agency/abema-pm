// app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project/ProjectCard'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { Plus, FolderOpen } from 'lucide-react'
import type { Project, Risk } from '@/types/project'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  const projectIds = (projects ?? []).map((p) => p.id)

  // Fetch cross-project WP and risk stats
  let overdueWp = 0
  let criticalRisks = 0

  if (projectIds.length > 0) {
    const today = new Date().toISOString().split('T')[0]

    const { count: overdue } = await supabase
      .from('work_packages')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .lt('due_date', today)
      .not('status', 'in', '(completed,cancelled)')

    const { data: riskData } = await supabase
      .from('risks')
      .select('score, status')
      .in('project_id', projectIds)
      .neq('status', 'closed')

    overdueWp = overdue ?? 0
    criticalRisks = (riskData ?? []).filter((r: Pick<Risk, 'score' | 'status'>) => r.score >= 15).length
  }

  const activeProjects = (projects ?? []).filter((p) => p.status === 'active').length
  const ragStatus = criticalRisks > 0 || overdueWp > Math.max(1, projectIds.length * 2)
    ? 'red'
    : overdueWp > 0
    ? 'amber'
    : 'green'

  return (
    <div>
      <AppHeader title="Mes projets" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-sm">
            {projects?.length ?? 0} projet{(projects?.length ?? 0) > 1 ? 's' : ''} actif{(projects?.length ?? 0) > 1 ? 's' : ''}
          </p>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Link>
          </Button>
        </div>

        {(projects?.length ?? 0) > 0 && (
          <KpiCards
            activeProjects={activeProjects}
            overdueWp={overdueWp}
            criticalRisks={criticalRisks}
            ragStatus={ragStatus}
          />
        )}

        {!projects?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-medium text-slate-700 mb-2">Aucun projet pour l&apos;instant</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              Créez votre premier projet pour commencer à gérer vos livrables, risques et parties prenantes.
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier projet
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project as Project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
