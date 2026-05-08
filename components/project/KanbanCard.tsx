'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WorkPackage, WpStatus } from '@/types/project'

const STATUS_BADGE: Record<WpStatus, { label: string; className: string }> = {
  not_started: { label: 'À faire', className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
  blocked: { label: 'Bloqué', className: 'bg-red-100 text-red-700' },
  completed: { label: 'Terminé', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé', className: 'bg-slate-100 text-slate-400' },
}

type Props = {
  workPackage: WorkPackage
  columnId?: WpStatus
  isDragging?: boolean
}

export function KanbanCard({ workPackage: wp, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: wp.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const isOverdue = wp.due_date && new Date(wp.due_date) < new Date() && wp.status !== 'completed'

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          'p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow',
          isDragging && 'shadow-lg rotate-2',
          isOverdue && 'border-red-200'
        )}
        {...listeners}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="w-3 h-3 text-slate-300 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 line-clamp-2">{wp.name}</p>
            {wp.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{wp.description}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              {wp.due_date && (
                <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-500' : 'text-slate-400')}>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(wp.due_date), 'd MMM', { locale: fr })}
                </div>
              )}
              {wp.tags.length > 0 && (
                <div className="flex gap-1">
                  {wp.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {wp.wbs_code && (
              <p className="text-xs text-slate-300 mt-1">{wp.wbs_code}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
