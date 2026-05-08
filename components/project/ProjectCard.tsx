import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types/project'

const APPROACH_LABELS: Record<string, string> = {
  predictive: 'Prédictif',
  agile: 'Agile',
  hybrid: 'Hybride',
}

const APPROACH_COLORS: Record<string, string> = {
  predictive: 'bg-blue-100 text-blue-700',
  agile: 'bg-green-100 text-green-700',
  hybrid: 'bg-purple-100 text-purple-700',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  on_hold: 'En pause',
  completed: 'Terminé',
  archived: 'Archivé',
  cancelled: 'Annulé',
}

type Props = { project: Project }

export function ProjectCard({ project }: Props) {
  return (
    <Link href={`/projects/${project.id}/kanban`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {project.name}
            </h3>
            <Badge className={APPROACH_COLORS[project.approach] ?? 'bg-slate-100 text-slate-700'} variant="outline">
              {APPROACH_LABELS[project.approach] ?? project.approach}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
            <span>{STATUS_LABELS[project.status] ?? project.status}</span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 justify-between">
          {project.target_end_date ? (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(project.target_end_date), 'd MMM yyyy', { locale: fr })}
            </div>
          ) : (
            <span />
          )}
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </CardFooter>
      </Card>
    </Link>
  )
}
