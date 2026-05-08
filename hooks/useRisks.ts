'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Risk } from '@/types/project'

export function useRisks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['risks', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('project_id', projectId)
        .order('score', { ascending: false })
      if (error) throw error
      return data as Risk[]
    },
    enabled: !!projectId,
  })
}

export function useCreateRisk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (risk: Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'score'>) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('risks')
        .insert(risk)
        .select()
        .single()
      if (error) throw error
      return data as Risk
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risks', data.project_id] })
    },
  })
}

export function useUpdateRisk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, score: _score, ...updates }: Partial<Risk> & { id: string }) => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('risks')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Risk
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risks', data.project_id] })
    },
  })
}

export function useDeleteRisk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('risks').delete().eq('id', id)
      if (error) throw error
      return { id, projectId }
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['risks', projectId] })
    },
  })
}
