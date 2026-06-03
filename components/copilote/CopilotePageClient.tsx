// components/copilote/CopilotePageClient.tsx
'use client'

import { useState } from 'react'
import { AgentSelector } from './AgentSelector'
import { CopiloteIA } from './CopiloteIA'
import { WorkflowTriggers } from './WorkflowTriggers'
import type { AgentId, Plan } from '@/types/copilote'

interface CopilotePageClientProps {
  plan: Plan
  dailyUsed: number
  projectId?: string
}

export function CopilotePageClient({ plan, dailyUsed, projectId }: CopilotePageClientProps) {
  const [activeAgent, setActiveAgent] = useState<AgentId>('assistant')

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <AgentSelector
        currentPlan={plan}
        activeAgent={activeAgent}
        onSelect={setActiveAgent}
        dailyUsed={dailyUsed}
      />
      <div className="flex-1 min-h-0 flex flex-col bg-white">
        <CopiloteIA projectId={projectId} activeAgent={activeAgent} />
      </div>
      {plan === 'team' && projectId && (
        <div className="w-56 flex-shrink-0 bg-slate-50 border-l p-4">
          <WorkflowTriggers projectId={projectId} plan={plan} />
        </div>
      )}
    </div>
  )
}
