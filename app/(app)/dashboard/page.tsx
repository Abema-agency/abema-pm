import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project/ProjectCard'
import { Plus, FolderOpen } from 'lucide-react'
import type { Project } from '@/types/project'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <AppHeader title="Mes projets" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-500 text-sm">
              {projects?.length ?? 0} projet{(projects?.length ?? 0) > 1 ? 's' : ''} actif{(projects?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Link>
          </Button>
        </div>

        {!projects?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-medium text-slate-700 mb-2">Aucun projet pour l'instant</h2>
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
