'use client'

import { useEffect, useState } from 'react'
import type { Plan } from '@/types/copilote'
import { useWorkflowTrigger } from '@/hooks/useAiAgent'
import { Button } from '@/components/ui/button'
import { FileText, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface WorkflowTriggersProps {
  projectId: string
  plan?: Plan
}

export function WorkflowTriggers({ projectId, plan: initialPlan }: WorkflowTriggersProps) {
  const [plan, setPlan] = useState<Plan | null>(initialPlan ?? null)
  const { trigger, isLoading } = useWorkflowTrigger()

  useEffect(() => {
    // If plan is provided as prop, use it. Otherwise fetch from API.
    if (initialPlan) {
      setPlan(initialPlan)
    } else {
      fetch('/api/user/plan')
        .then((r) => r.json())
        .then((d: { plan: Plan }) => setPlan(d.plan))
        .catch(() => setPlan('lite'))
    }
  }, [initialPlan])

  if (plan !== 'team') return null

  async function handleStatusReport() {
    const result = await trigger('status_report', projectId)
    if (result.success) {
      toast.success(result.message ?? 'Rapport de statut déclenché')
    } else {
      toast.error(result.error ?? 'Erreur lors du déclenchement')
    }
  }

  async function handleRiskAlert() {
    const result = await trigger('risk_alert', projectId)
    if (result.success) {
      toast.success(result.message ?? 'Alerte risque déclenchée')
    } else {
      toast.error(result.error ?? 'Erreur lors du déclenchement')
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
        Workflows N8N
      </p>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 text-sm"
        onClick={handleStatusReport}
        disabled={isLoading}
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <FileText className="w-4 h-4 text-indigo-500" />}
        Générer rapport de statut
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 text-sm"
        onClick={handleRiskAlert}
        disabled={isLoading}
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <AlertTriangle className="w-4 h-4 text-amber-500" />}
        Déclencher alerte risque
      </Button>
    </div>
  )
}
