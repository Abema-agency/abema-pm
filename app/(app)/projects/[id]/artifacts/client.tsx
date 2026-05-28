'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { FileText, Sparkles, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const ARTIFACT_TYPES = [
  { value: 'project_charter', label: 'Charte de projet' },
  { value: 'risk_register', label: 'Registre des risques' },
  { value: 'stakeholder_register', label: 'Registre parties prenantes' },
  { value: 'wbs', label: 'WBS' },
  { value: 'communications_plan', label: 'Plan de communication' },
  { value: 'status_report', label: 'Rapport de statut' },
  { value: 'lessons_learned', label: 'Leçons apprises' },
]

type Props = { projectId: string }

export function ArtifactsClient({ projectId }: Props) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [generating, setGenerating] = useState<string | null>(null)

  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: ['artifacts', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  async function generateArtifact(type: string) {
    setGenerating(type)
    try {
      const response = await fetch('/api/ai/generate-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, artifactType: type }),
      })
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['artifacts', projectId] })
      } else {
        const data = await response.json() as { error?: string }
        throw new Error(data.error ?? `Erreur ${response.status}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la génération'
      alert(`Erreur : ${msg}`)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="p-6">
      {/* Generation panel */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Générer un artefact PMBOK 8</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ARTIFACT_TYPES.map((t) => (
            <Button
              key={t.value}
              variant="outline"
              size="sm"
              className="bg-white"
              disabled={!!generating}
              onClick={() => generateArtifact(t.value)}
            >
              {generating === t.value ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  Génération...
                </span>
              ) : t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Artifacts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg" />)}
        </div>
      ) : artifacts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p>Aucun artefact généré. Utilisez les boutons ci-dessus pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artifacts.map((artifact) => (
            <Card key={artifact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium">{artifact.title}</CardTitle>
                  {artifact.generated_by_ai && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <Sparkles className="w-2.5 h-2.5 mr-1" />IA
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    {artifact.status === 'approved'
                      ? <CheckCircle className="w-3 h-3 text-green-500" />
                      : <Clock className="w-3 h-3" />
                    }
                    {artifact.status === 'draft' ? 'Brouillon' : artifact.status === 'review' ? 'En revue' : 'Approuvé'}
                  </span>
                  <span>{format(new Date(artifact.created_at), 'd MMM yyyy', { locale: fr })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
