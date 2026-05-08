'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WorkPackage } from '@/types/project'

export function useWorkPackages(projectId: string | undefined) {
  return useQuery({
    queryKey: ['work_packages', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('work_packages')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
      if (error) throw error
      return data as WorkPackage[]
    },
    enabled: !!projectId,
  })
}

export function useCreateWorkPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (wp: Omit<WorkPackage, 'id' | 'created_at' | 'updated_at'>) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('work_packages')
        .insert(wp)
        .select()
        .single()
      if (error) throw error
      return data as WorkPackage
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work_packages', data.project_id] })
    },
  })
}

export function useUpdateWorkPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkPackage> & { id: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('work_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as WorkPackage
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work_packages', data.project_id] })
    },
  })
}

export function useDeleteWorkPackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('work_packages').delete().eq('id', id)
      if (error) throw error
      return { id, projectId }
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['work_packages', projectId] })
    },
  })
}
