'use client'

import { create } from 'zustand'
import type { Project, WpStatus } from '@/types/project'

type KanbanFilters = {
  ownerId: string | null
  tags: string[]
}

type ProjectStore = {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  kanbanFilters: KanbanFilters
  setKanbanFilter: (filters: Partial<KanbanFilters>) => void
  resetKanbanFilters: () => void
}

const DEFAULT_FILTERS: KanbanFilters = { ownerId: null, tags: [] }

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  kanbanFilters: DEFAULT_FILTERS,
  setKanbanFilter: (filters) =>
    set((state) => ({ kanbanFilters: { ...state.kanbanFilters, ...filters } })),
  resetKanbanFilters: () => set({ kanbanFilters: DEFAULT_FILTERS }),
}))
