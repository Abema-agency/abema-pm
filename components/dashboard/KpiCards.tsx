// components/dashboard/KpiCards.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

const RAG_COLORS = {
  red:   { bg: 'bg-red-950/40',    border: 'border-red-800',    text: 'text-red-400' },
  amber: { bg: 'bg-amber-950/40',  border: 'border-amber-700',  text: 'text-amber-400' },
  green: { bg: 'bg-green-950/40',  border: 'border-green-800',  text: 'text-green-400' },
  none:  { bg: 'bg-slate-800/40',  border: 'border-slate-700',  text: 'text-slate-200' },
}

interface KpiCardsProps {
  activeProjects: number
  overdueWp: number
  criticalRisks: number
  ragStatus: 'red' | 'amber' | 'green'
}

export function KpiCards({ activeProjects, overdueWp, criticalRisks, ragStatus }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <KpiCard
        label="Projets actifs"
        value={activeProjects}
        rag="none"
        href="/dashboard"
      />
      <KpiCard
        label="Tâches en retard"
        value={overdueWp}
        rag={overdueWp > 0 ? 'red' : 'green'}
      />
      <KpiCard
        label="Risques critiques"
        value={criticalRisks}
        rag={criticalRisks > 0 ? 'red' : 'green'}
      />
      <div className={cn(
        'rounded-lg border p-4',
        RAG_COLORS[ragStatus].bg,
        RAG_COLORS[ragStatus].border,
      )}>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Score RAG global</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('w-3 h-3 rounded-full flex-shrink-0', {
            'bg-red-500': ragStatus === 'red',
            'bg-amber-500': ragStatus === 'amber',
            'bg-green-500': ragStatus === 'green',
          })} />
          <span className={cn('text-lg font-bold font-mono uppercase', RAG_COLORS[ragStatus].text)}>
            {ragStatus}
          </span>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, rag, href }: {
  label: string
  value: number
  rag: keyof typeof RAG_COLORS
  href?: string
}) {
  const colors = RAG_COLORS[rag]
  const inner = (
    <div className={cn('rounded-lg border p-4', colors.bg, colors.border)}>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn('text-3xl font-bold font-mono', colors.text)}>{value}</p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}
