'use client'

import { useState } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './KanbanCard'
import { useWorkPackages, useUpdateWorkPackage } from '@/hooks/useWorkPackages'
import type { WorkPackage, WpStatus } from '@/types/project'
import { cn } from '@/lib/utils'

const COLUMNS: { id: WpStatus; label: string; color: string }[] = [
  { id: 'not_started', label: 'Non démarré', color: 'border-slate-300' },
  { id: 'in_progress', label: 'En cours', color: 'border-blue-400' },
  { id: 'blocked', label: 'Bloqué', color: 'border-red-400' },
  { id: 'completed', label: 'Terminé', color: 'border-green-400' },
]

type Props = { projectId: string }

export function KanbanBoard({ projectId }: Props) {
  const { data: workPackages = [], isLoading } = useWorkPackages(projectId)
  const updateWp = useUpdateWorkPackage()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedWp = workPackages.find((wp) => wp.id === active.id)
    if (!draggedWp) return

    // If dropped over a column header
    const targetStatus = COLUMNS.find((col) => col.id === over.id)?.id
    if (targetStatus && targetStatus !== draggedWp.status) {
      await updateWp.mutateAsync({ id: draggedWp.id, status: targetStatus })
    }
  }

  const activeWp = workPackages.find((wp) => wp.id === activeId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 p-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="h-96 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {COLUMNS.map((col) => {
          const colWps = workPackages.filter((wp) => wp.status === col.id)
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              workPackages={colWps}
              projectId={projectId}
            />
          )
        })}
      </div>
      <DragOverlay>
        {activeWp && <KanbanCard workPackage={activeWp} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({
  column,
  workPackages,
  projectId,
}: {
  column: (typeof COLUMNS)[number]
  workPackages: WorkPackage[]
  projectId: string
}) {
  return (
    <div
      className={cn('bg-slate-50 rounded-lg border-t-2 min-h-[500px] flex flex-col', column.color)}
      data-column-id={column.id}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{column.label}</span>
          <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
            {workPackages.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={workPackages.map((wp) => wp.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
          {workPackages.map((wp) => (
            <KanbanCard key={wp.id} workPackage={wp} columnId={column.id} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
