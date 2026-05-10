'use client'

import { useWorkflowTrigger } from '@/hooks/useAiAgent'
import { Button } from '@/components/ui/button'
import { FileText, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface WorkflowTriggersProps {
  projectId: string
}

export function WorkflowTriggers({ projectId }: WorkflowTriggersProps) {
  const { trigger, isLoading } = useWorkflowTrigger()

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
