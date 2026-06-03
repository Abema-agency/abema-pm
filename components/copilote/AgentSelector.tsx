// components/copilote/AgentSelector.tsx
'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AGENTS, PLAN_LIMITS } from '@/types/copilote'
import type { AgentId, Plan } from '@/types/copilote'

const PLAN_LABELS: Record<Plan, string> = { lite: 'Lite', solo: 'Solo', pro: 'Pro', team: 'Team' }

function getPlanRequired(agentId: AgentId): Plan | null {
  const plans: Plan[] = ['lite', 'solo', 'pro', 'team']
  for (const p of plans) {
    if ((PLAN_LIMITS[p].agents as AgentId[]).includes(agentId)) return p
  }
  return null
}

interface AgentSelectorProps {
  currentPlan: Plan
  activeAgent: AgentId
  onSelect: (id: AgentId) => void
  dailyUsed: number
}

export function AgentSelector({ currentPlan, activeAgent, onSelect, dailyUsed }: AgentSelectorProps) {
  const allowedAgents = PLAN_LIMITS[currentPlan].agents as AgentId[]
  const dailyLimit = PLAN_LIMITS[currentPlan].dailyRequests

  const usedPct = dailyLimit === -1 ? 5 : Math.min(100, Math.round((dailyUsed / dailyLimit) * 100))
  const barColor = usedPct >= 90 ? 'bg-red-500' : usedPct >= 70 ? 'bg-amber-500' : 'bg-blue-500'

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-60 flex-shrink-0">
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Agents — Plan {PLAN_LABELS[currentPlan]}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-2">
        {AGENTS.map((agent) => {
          const unlocked = allowedAgents.includes(agent.id)
          const planRequired = getPlanRequired(agent.id)

          if (unlocked) {
            return (
              <button
                key={agent.id}
                onClick={() => onSelect(agent.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-md border transition-colors',
                  activeAgent === agent.id
                    ? 'border-blue-500 bg-blue-950/60 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                )}
              >
                <p className="text-xs font-semibold leading-tight">{agent.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{agent.description}</p>
              </button>
            )
          }

          return (
            <div
              key={agent.id}
              className="px-3 py-2.5 rounded-md border border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed"
              title={`Disponible en plan ${PLAN_LABELS[planRequired ?? 'pro']}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 leading-tight">{agent.label}</p>
                <div className="flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-600" />
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-800 px-1 py-0.5 rounded">
                    {PLAN_LABELS[planRequired ?? 'pro']}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quota bar */}
      <div className="px-3 py-3 border-t border-slate-700">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{dailyUsed} utilisés</span>
          <span>{dailyLimit === -1 ? '∞' : dailyLimit} / jour</span>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', barColor)} style={{ width: `${usedPct}%` }} />
        </div>
        {currentPlan !== 'team' && (
          <Link href="/pricing" className="text-[10px] text-slate-600 hover:text-slate-400 mt-1.5 block transition-colors">
            Augmenter le quota →
          </Link>
        )}
      </div>
    </div>
  )
}
