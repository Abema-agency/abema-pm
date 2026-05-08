'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStakeholders } from '@/hooks/useStakeholders'
import { STAKEHOLDER_ATTITUDES } from '@/lib/pmbok/constants'
import type { Stakeholder } from '@/types/project'

type Props = { projectId: string }

const ATTITUDE_COLORS: Record<string, string> = {
  champion: 'bg-green-100 text-green-700',
  supportive: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-600',
  resistant: 'bg-orange-100 text-orange-700',
  blocker: 'bg-red-100 text-red-700',
}

export function StakeholdersClient({ projectId }: Props) {
  const { data: stakeholders = [], isLoading } = useStakeholders(projectId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">{stakeholders.length} partie{stakeholders.length > 1 ? 's' : ''} prenante{stakeholders.length > 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />Ajouter
        </Button>
      </div>

      {/* Power/Interest Grid */}
      {stakeholders.length > 0 && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg">
          <p className="text-xs font-medium text-slate-500 mb-3">Matrice Pouvoir / Intérêt</p>
          <PowerInterestGrid stakeholders={stakeholders} />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Nom</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Rôle</th>
              <th className="text-center py-3 px-3 text-slate-500 font-medium">Pouvoir</th>
              <th className="text-center py-3 px-3 text-slate-500 font-medium">Intérêt</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Attitude</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Engagement actuel</th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Aucune partie prenante. Ajoutez-les pour remplir votre registre PMBOK 8.
                </td>
              </tr>
            ) : (
              stakeholders.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-800">{s.name}</td>
                  <td className="py-3 px-3 text-slate-500">{s.role ?? '—'}</td>
                  <td className="py-3 px-3 text-center">{s.power ?? '—'}/5</td>
                  <td className="py-3 px-3 text-center">{s.influence ?? '—'}/5</td>
                  <td className="py-3 px-3">
                    {s.attitude && (
                      <Badge className={ATTITUDE_COLORS[s.attitude]} variant="secondary">
                        {STAKEHOLDER_ATTITUDES.find((a) => a.value === s.attitude)?.label ?? s.attitude}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 capitalize">{s.current_engagement}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PowerInterestGrid({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const size = 240
  const pad = 24

  return (
    <svg width={size + pad * 2} height={size + pad * 2} className="block">
      {/* Quadrant backgrounds */}
      <rect x={pad} y={pad} width={size / 2} height={size / 2} fill="#FEF3C7" />
      <rect x={pad + size / 2} y={pad} width={size / 2} height={size / 2} fill="#DCFCE7" />
      <rect x={pad} y={pad + size / 2} width={size / 2} height={size / 2} fill="#F1F5F9" />
      <rect x={pad + size / 2} y={pad + size / 2} width={size / 2} height={size / 2} fill="#DBEAFE" />
      {/* Labels */}
      <text x={pad + size / 4} y={pad + 14} textAnchor="middle" fontSize={9} fill="#92400E">Tenir informé</text>
      <text x={pad + 3 * size / 4} y={pad + 14} textAnchor="middle" fontSize={9} fill="#166534">Gérer attentivement</text>
      <text x={pad + size / 4} y={pad + size - 6} textAnchor="middle" fontSize={9} fill="#475569">Surveiller</text>
      <text x={pad + 3 * size / 4} y={pad + size - 6} textAnchor="middle" fontSize={9} fill="#1E40AF">Tenir satisfait</text>
      {/* Axes */}
      <line x1={pad} y1={pad + size / 2} x2={pad + size} y2={pad + size / 2} stroke="#CBD5E1" strokeWidth={1} />
      <line x1={pad + size / 2} y1={pad} x2={pad + size / 2} y2={pad + size} stroke="#CBD5E1" strokeWidth={1} />
      {/* Stakeholder dots */}
      {stakeholders.map((s) => {
        if (!s.power || !s.influence) return null
        const x = pad + ((s.influence - 1) / 4) * size
        const y = pad + size - ((s.power - 1) / 4) * size
        return (
          <g key={s.id}>
            <circle cx={x} cy={y} r={6} fill="#2563EB" opacity={0.8} />
            <text x={x} y={y - 9} textAnchor="middle" fontSize={8} fill="#1E40AF">
              {s.name.split(' ')[0]}
            </text>
          </g>
        )
      })}
      {/* Axis labels */}
      <text x={pad + size / 2} y={pad + size + 18} textAnchor="middle" fontSize={9} fill="#64748B">Intérêt →</text>
      <text x={pad - 14} y={pad + size / 2} textAnchor="middle" fontSize={9} fill="#64748B" transform={`rotate(-90, ${pad - 14}, ${pad + size / 2})`}>Pouvoir →</text>
    </svg>
  )
}
