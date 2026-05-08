'use client'

import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRisks } from '@/hooks/useRisks'
import { getRiskScoreColor, RISK_CATEGORIES } from '@/lib/pmbok/constants'
import { RiskForm } from '@/components/forms/NewRiskForm'
import type { Risk } from '@/types/project'

type Props = { projectId: string }

export function RisksClient({ projectId }: Props) {
  const { data: risks = [], isLoading } = useRisks(projectId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return <div className="p-6 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">{risks.length} risque{risks.length > 1 ? 's' : ''} identifié{risks.length > 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-blue-600">
            <Sparkles className="w-4 h-4" />
            Suggérer via IA
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />Ajouter un risque
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouveau risque</DialogTitle>
              </DialogHeader>
              <RiskForm projectId={projectId} onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Risk Matrix */}
      <RiskMatrix risks={risks} />

      {/* Risk Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Code</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Titre</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Catégorie</th>
              <th className="text-center py-3 px-3 text-slate-500 font-medium">P</th>
              <th className="text-center py-3 px-3 text-slate-500 font-medium">I</th>
              <th className="text-center py-3 px-3 text-slate-500 font-medium">Score</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Stratégie</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {risks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Aucun risque identifié. Cliquez sur "Ajouter un risque" ou laissez l'IA en suggérer.
                </td>
              </tr>
            ) : (
              risks.map((risk) => (
                <RiskRow key={risk.id} risk={risk} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RiskRow({ risk }: { risk: Risk }) {
  const categoryLabel = RISK_CATEGORIES.find((c) => c.value === risk.category)?.label ?? risk.category

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-3 font-mono text-xs text-slate-400">{risk.code ?? '—'}</td>
      <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">{risk.title}</td>
      <td className="py-3 px-3 text-slate-500">{categoryLabel}</td>
      <td className="py-3 px-3 text-center">{risk.probability ?? '—'}</td>
      <td className="py-3 px-3 text-center">{risk.impact ?? '—'}</td>
      <td className="py-3 px-3 text-center">
        <Badge className={getRiskScoreColor(risk.score)} variant="secondary">
          {risk.score}
        </Badge>
      </td>
      <td className="py-3 px-3 text-slate-500 capitalize">{risk.strategy ?? '—'}</td>
      <td className="py-3 px-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          risk.status === 'open' ? 'bg-amber-100 text-amber-700' :
          risk.status === 'mitigating' ? 'bg-blue-100 text-blue-700' :
          risk.status === 'closed' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {risk.status === 'open' ? 'Ouvert' :
           risk.status === 'mitigating' ? 'Atténuation' :
           risk.status === 'closed' ? 'Fermé' : 'Réalisé'}
        </span>
      </td>
    </tr>
  )
}

function RiskMatrix({ risks }: { risks: Risk[] }) {
  const COLORS = [
    ['bg-green-100', 'bg-green-100', 'bg-yellow-100', 'bg-yellow-100', 'bg-orange-100'],
    ['bg-green-100', 'bg-yellow-100', 'bg-yellow-100', 'bg-orange-100', 'bg-orange-100'],
    ['bg-yellow-100', 'bg-yellow-100', 'bg-orange-100', 'bg-orange-100', 'bg-red-100'],
    ['bg-yellow-100', 'bg-orange-100', 'bg-orange-100', 'bg-red-100', 'bg-red-100'],
    ['bg-orange-100', 'bg-orange-100', 'bg-red-100', 'bg-red-100', 'bg-red-100'],
  ]

  return (
    <div className="inline-block">
      <p className="text-xs text-slate-500 mb-2 font-medium">Matrice Probabilité × Impact</p>
      <div className="flex gap-0">
        <div className="flex flex-col justify-between pr-2 py-0.5">
          {[5, 4, 3, 2, 1].map((p) => (
            <span key={p} className="text-xs text-slate-400 h-10 flex items-center">{p}</span>
          ))}
        </div>
        <div className="space-y-0">
          {[5, 4, 3, 2, 1].map((p) => (
            <div key={p} className="flex gap-0">
              {[1, 2, 3, 4, 5].map((i) => {
                const cellRisks = risks.filter((r) => r.probability === p && r.impact === i)
                return (
                  <div
                    key={i}
                    className={`w-10 h-10 border border-white/80 ${COLORS[5 - p][i - 1]} flex items-center justify-center text-xs font-medium text-slate-600`}
                  >
                    {cellRisks.length > 0 ? cellRisks.length : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between pl-6 mt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="w-10 text-center text-xs text-slate-400">{i}</span>
        ))}
      </div>
      <div className="text-center text-xs text-slate-400 mt-0.5 pl-6">Impact →</div>
    </div>
  )
}
