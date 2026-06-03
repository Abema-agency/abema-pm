// components/dashboard/ProjectDashboard.tsx
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Sparkline } from './Sparkline'
import type { ProjectMetrics } from '@/lib/dashboard/metrics'
import type { Project } from '@/types/project'

const SECTOR_LABELS: Record<string, string> = {
  construction: 'BTP',
  it_software: 'IT',
  marketing_events: 'Marketing',
  rd_innovation: 'R&D',
  transformation: 'Transformation',
  product_launch: 'Lancement produit',
  regulatory_public: 'Régulation',
  other: 'Autre',
}

const APPROACH_LABELS: Record<string, string> = {
  predictive: 'Prédictif',
  agile: 'Agile',
  hybrid: 'Hybride',
}

function fmt(n: number | null | undefined, decimals = 0): string {
  if (n == null) return 'N/A'
  return n.toFixed(decimals)
}

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`
}

function fmtCurrency(n: number | null, currency = 'EUR'): string {
  if (n == null) return 'N/A'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return format(new Date(d), 'd MMM yyyy', { locale: fr })
}

const SPI_COLOR = (spi: number | null) =>
  spi == null ? 'text-slate-400'
  : spi >= 0.95 ? 'text-green-400'
  : spi >= 0.9  ? 'text-amber-400'
  : 'text-red-400'

interface ProjectDashboardProps {
  project: Project
  metrics: ProjectMetrics
}

export function ProjectDashboard({ project, metrics }: ProjectDashboardProps) {
  return (
    <div className="bg-[#0F172A] text-slate-300 p-4 space-y-3 min-h-full">

      {/* ── Header bar ── */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-md px-4 py-3 grid grid-cols-6 gap-4 items-center text-xs">
        <div className="col-span-2">
          <p className="text-sm font-bold text-slate-100 truncate">{project.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {project.sector ? (SECTOR_LABELS[project.sector] ?? project.sector) : '—'}
            {' · '}
            {APPROACH_LABELS[project.approach] ?? project.approach}
          </p>
        </div>
        <HeaderField label="Budget" value={project.budget ? fmtCurrency(project.budget, project.budget_currency) : '—'} />
        <HeaderField label="Début" value={fmtDate(project.start_date)} />
        <HeaderField label="Fin planifiée" value={fmtDate(project.target_end_date)} />
        <HeaderField
          label="Variance"
          value={metrics.remainingDays != null && metrics.remainingDays < 0
            ? `${metrics.remainingDays}j`
            : metrics.remainingDays != null
            ? `+${metrics.remainingDays}j`
            : '—'}
          valueClass={metrics.remainingDays != null && metrics.remainingDays < 0 ? 'text-red-400' : 'text-green-400'}
        />
      </div>

      {/* ── Row 1: Avancement | Jalons | Risques ── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Avancement */}
        <Section title="Avancement" headerClass="bg-blue-800">
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            <MetricBox label="Planifié" value={fmtPct(metrics.cumPlannedPct)} />
            <MetricBox
              label="Réel"
              value={fmtPct(metrics.cumActualPct)}
              valueClass={metrics.spi !== null && metrics.spi < 0.9 ? 'text-amber-400' : 'text-slate-100'}
            />
            <MetricBox
              label="Variance"
              value={`${metrics.cumActualPct >= metrics.cumPlannedPct ? '+' : ''}${fmtPct(metrics.cumActualPct - metrics.cumPlannedPct)}`}
              valueClass={metrics.cumActualPct < metrics.cumPlannedPct ? 'text-red-400' : 'text-green-400'}
            />
            <MetricBox
              label="Progrès sem."
              value={`${metrics.weeklyProgressPct >= 0 ? '+' : ''}${fmt(metrics.weeklyProgressPct, 1)}%`}
              valueClass="text-slate-100"
            />
          </div>
          <Sparkline data={metrics.sparkline} />
          {/* SPI gauge */}
          <div className="mt-2 bg-slate-900 border border-slate-800 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">SPI</span>
              <span className={cn('text-sm font-bold font-mono', SPI_COLOR(metrics.spi))}>
                {metrics.spi != null ? fmt(metrics.spi, 2) : 'N/A'}
              </span>
            </div>
            <div className="relative h-1 bg-slate-800 rounded-full mt-1.5 overflow-visible">
              {metrics.spi != null && (
                <div
                  className={cn('h-1 rounded-full', SPI_COLOR(metrics.spi).replace('text-', 'bg-'))}
                  style={{ width: `${Math.min(100, Math.round(metrics.spi * 100))}%` }}
                />
              )}
              {/* Target marker at 1.0 */}
              <div className="absolute right-0 -top-1 w-0.5 h-3 bg-green-500 rounded" title="Cible: 1.0" />
            </div>
            <div className="flex justify-between text-[8px] text-slate-700 font-mono mt-0.5">
              <span>0.0</span><span>0.9</span><span>0.95</span><span className="text-green-700">★1.0</span>
            </div>
          </div>
        </Section>

        {/* Jalons */}
        <Section title="Jalons & Calendrier" headerClass="bg-slate-600">
          <table className="w-full text-[10px] mb-2">
            <tbody>
              <DurationRow label="Durée totale" days={metrics.totalDays} pct={null} />
              <DurationRow label="Durée écoulée" days={metrics.elapsedDays} pct={metrics.totalDays ? (metrics.elapsedDays ?? 0) / metrics.totalDays : null} />
              <DurationRow label="Durée restante" days={metrics.remainingDays} pct={null} />
            </tbody>
          </table>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">Prochains jalons</p>
          <div className="space-y-1">
            {metrics.milestones.length === 0 && (
              <p className="text-[10px] text-slate-600 italic">Aucune tâche avec échéance</p>
            )}
            {metrics.milestones.map((ms, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', ms.isOverdue ? 'bg-red-500' : 'bg-slate-500')} />
                <span className="flex-1 truncate text-slate-300">{ms.name}</span>
                <span className={cn('font-mono', ms.isOverdue ? 'text-red-400' : 'text-slate-500')}>
                  {fmtDate(ms.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Risques */}
        <Section title="Qualité & Risques" headerClass="bg-orange-800">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            <MetricBox label="Tâches retard" value={String(metrics.overdueWp)} valueClass={metrics.overdueWp > 0 ? 'text-red-400' : 'text-green-400'} />
            <MetricBox label="Tâches terminées" value={String(metrics.completedWp)} valueClass="text-green-400" />
            <MetricBox label="Revues en retard" value={String(metrics.overdueRiskReviews)} valueClass={metrics.overdueRiskReviews > 0 ? 'text-amber-400' : 'text-green-400'} />
            <MetricBox label="RAG global" value={metrics.ragStatus.toUpperCase()} valueClass={`text-${metrics.ragStatus === 'red' ? 'red' : metrics.ragStatus === 'amber' ? 'amber' : 'green'}-400`} />
          </div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">Matrice risques</p>
          <RiskRow label="Critiques (P×I ≥ 15)" count={metrics.criticalRisks} color="text-red-400" />
          <RiskRow label="Élevés (P×I 8–14)" count={metrics.highRisks} color="text-amber-400" />
          <RiskRow label="Modérés (P×I ≤ 7)" count={metrics.moderateRisks} color="text-slate-400" />
        </Section>
      </div>

      {/* ── Row 2: EVM | Narrative ── */}
      {metrics.bac !== null && (
        <div className="grid grid-cols-5 gap-3">
          {/* EVM */}
          <div className="col-span-2">
            <Section title="Valeur acquise (EVM)" headerClass="bg-teal-800">
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <EvmBadge label="BAC" value={fmtCurrency(metrics.bac, project.budget_currency)} />
                <EvmBadge label="PV" value={fmtCurrency(metrics.pv, project.budget_currency)} />
                <EvmBadge label="EV" value={fmtCurrency(metrics.ev, project.budget_currency)} />
                <EvmBadge
                  label="SV"
                  value={fmtCurrency(metrics.sv, project.budget_currency)}
                  valueClass={metrics.sv !== null && metrics.sv < 0 ? 'text-red-400' : 'text-green-400'}
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <EvmBadge label="SPI" value={metrics.spi != null ? fmt(metrics.spi, 2) : 'N/A'} valueClass={SPI_COLOR(metrics.spi)} />
                <EvmBadge
                  label="EAC estimé"
                  value={fmtCurrency(metrics.eac, project.budget_currency)}
                  valueClass={metrics.eac !== null && metrics.bac !== null && metrics.eac > metrics.bac ? 'text-red-400' : 'text-green-400'}
                  alert={metrics.eac !== null && metrics.bac !== null && metrics.eac > metrics.bac}
                />
              </div>
            </Section>
          </div>

          {/* Narrative placeholder */}
          <div className="col-span-3">
            <Section title="Rapport narratif" headerClass="bg-purple-800">
              <div className="grid grid-cols-3 gap-px bg-slate-700 rounded overflow-hidden text-[10px]">
                {[
                  { title: 'En cours', note: 'Aucune donnée — générer un rapport via Copilote IA' },
                  { title: 'Points d\'attention', note: '' },
                  { title: 'Look-ahead', note: '' },
                ].map((col) => (
                  <div key={col.title} className="bg-[#1E293B] p-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{col.title}</p>
                    <p className="text-slate-600 italic">{col.note || '—'}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                Générez un rapport de statut via le{' '}
                <span className="text-blue-400">Copilote IA</span>
                {' '}pour alimenter cette section.
              </p>
            </Section>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Sub-components ──

function Section({ title, headerClass, children }: { title: string; headerClass: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-md overflow-hidden">
      <div className={cn('px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white', headerClass)}>
        {title}
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function HeaderField({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={cn('text-xs font-semibold font-mono mt-0.5 text-slate-200', valueClass)}>{value}</p>
    </div>
  )
}

function MetricBox({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-2 text-center">
      <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
      <p className={cn('text-base font-bold font-mono mt-1', valueClass ?? 'text-slate-100')}>{value}</p>
    </div>
  )
}

function DurationRow({ label, days, pct }: { label: string; days: number | null; pct: number | null }) {
  return (
    <tr className="border-b border-slate-800">
      <td className="py-1 text-slate-400">{label}</td>
      <td className="py-1 text-right font-mono text-slate-200">{days != null ? `${days}j` : '—'}</td>
      <td className="py-1 text-right font-mono text-slate-400">{pct != null ? fmtPct(pct) : ''}</td>
    </tr>
  )
}

function RiskRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-800 text-[10px]">
      <span className="text-slate-400">{label}</span>
      <span className={cn('font-mono font-bold', color)}>{count}</span>
    </div>
  )
}

function EvmBadge({ label, value, valueClass, alert }: { label: string; value: string; valueClass?: string; alert?: boolean }) {
  return (
    <div className={cn(
      'bg-slate-900 border rounded p-2 text-center',
      alert ? 'border-red-700 bg-red-950/20' : 'border-slate-700'
    )}>
      <p className={cn('text-[9px] uppercase tracking-widest', alert ? 'text-red-400 font-bold' : 'text-slate-500')}>{label}{alert ? ' ⚠' : ''}</p>
      <p className={cn('text-sm font-bold font-mono mt-0.5', valueClass ?? 'text-slate-200')}>{value}</p>
    </div>
  )
}
