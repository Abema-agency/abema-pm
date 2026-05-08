'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useWorkPackages } from '@/hooks/useWorkPackages'
import { Badge } from '@/components/ui/badge'
import type { WpStatus } from '@/types/project'

const STATUS_LABELS: Record<WpStatus, { label: string; className: string }> = {
  not_started: { label: 'À faire', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
  blocked: { label: 'Bloqué', className: 'bg-red-100 text-red-700' },
  completed: { label: 'Terminé', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé', className: 'bg-slate-100 text-slate-400' },
}

type Props = { projectId: string }

export function ListClient({ projectId }: Props) {
  const { data: wps = [], isLoading } = useWorkPackages(projectId)

  if (isLoading) {
    return <div className="p-6 space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-3 text-slate-500 font-medium">WBS</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Nom</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Statut</th>
              <th className="text-right py-3 px-3 text-slate-500 font-medium">Effort (h)</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Échéance</th>
            </tr>
          </thead>
          <tbody>
            {wps.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Aucun élément. Ajoutez des tâches depuis la vue Kanban.
                </td>
              </tr>
            ) : wps.map((wp) => {
              const statusInfo = STATUS_LABELS[wp.status]
              return (
                <tr key={wp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">{wp.wbs_code ?? '—'}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{wp.name}</td>
                  <td className="py-3 px-3">
                    <Badge className={statusInfo.className} variant="secondary">{statusInfo.label}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {wp.estimated_effort_hours ?? '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {wp.due_date ? format(new Date(wp.due_date), 'd MMM yyyy', { locale: fr }) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
