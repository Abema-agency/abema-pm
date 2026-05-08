'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Stakeholder } from '@/types/project'

export function useStakeholders(projectId: string | undefined) {
  return useQuery({
    queryKey: ['stakeholders', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('project_id', projectId)
        .order('power', { ascending: false })
      if (error) throw error
      return data as Stakeholder[]
    },
    enabled: !!projectId,
  })
}

export function useCreateStakeholder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stakeholders')
        .insert(stakeholder)
        .select()
        .single()
      if (error) throw error
      return data as Stakeholder
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders', data.project_id] })
    },
  })
}

export function useUpdateStakeholder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Stakeholder> & { id: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Stakeholder
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders', data.project_id] })
    },
  })
}
