'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Zap, TrendingUp } from 'lucide-react'
import type { CopiloteMetrics } from '@/types/copilote'
import { PLAN_LIMITS } from '@/types/copilote'

interface CopiloteDashboardProps {
  metrics: CopiloteMetrics
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total === -1 ? 0 : Math.min(100, Math.round((used / total) * 100))
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{used} utilisés</span>
        <span>{total === -1 ? '∞' : total} max</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        {total !== -1 && (
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        )}
        {total === -1 && (
          <div className="h-full rounded-full bg-indigo-500" style={{ width: '20%' }} />
        )}
      </div>
    </div>
  )
}

export function CopiloteDashboard({ metrics }: CopiloteDashboardProps) {
  const limits = PLAN_LIMITS[metrics.plan]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Messages IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">{metrics.aiMessagesUsed}</p>
          <UsageBar used={metrics.aiMessagesUsed} total={limits.aiMessagesPerMonth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Workflows déclenchés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">{metrics.workflowsTriggered}</p>
          <UsageBar used={metrics.workflowsTriggered} total={limits.workflowTriggersPerMonth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Plan actif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            className="mt-1 capitalize"
            variant={metrics.plan === 'lite' ? 'secondary' : 'default'}
          >
            {metrics.plan.charAt(0).toUpperCase() + metrics.plan.slice(1)}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
