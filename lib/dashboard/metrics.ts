// lib/dashboard/metrics.ts
import type { WorkPackage, Risk, Project } from '@/types/project'

export type WeeklyBar = { week: string; planned: number; actual: number }

export type MilestoneSummary = {
  name: string
  dueDate: string
  isOverdue: boolean
  varianceDays: number | null
}

export type ProjectMetrics = {
  totalWp: number
  completedWp: number
  overdueWp: number
  cumActualPct: number
  cumPlannedPct: number
  weeklyProgressPct: number
  spi: number | null
  elapsedDays: number | null
  totalDays: number | null
  remainingDays: number | null
  criticalRisks: number
  highRisks: number
  moderateRisks: number
  overdueRiskReviews: number
  ragStatus: 'red' | 'amber' | 'green'
  bac: number | null
  pv: number | null
  ev: number | null
  sv: number | null
  eac: number | null
  sparkline: WeeklyBar[]
  milestones: MilestoneSummary[]
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

export function computeProjectMetrics(
  project: Project,
  workPackages: WorkPackage[],
  risks: Risk[],
): ProjectMetrics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // ── Work package stats ──
  const totalWp = workPackages.length
  const completedWp = workPackages.filter((w) => w.status === 'completed').length
  const overdueWp = workPackages.filter(
    (w) => w.due_date && new Date(w.due_date) < today && w.status !== 'completed' && w.status !== 'cancelled'
  ).length
  const wpDueByToday = workPackages.filter(
    (w) => w.due_date && new Date(w.due_date) <= today
  ).length

  const cumActualPct = totalWp > 0 ? completedWp / totalWp : 0
  const cumPlannedPct = totalWp > 0 ? wpDueByToday / totalWp : 0
  const spi = cumPlannedPct > 0 ? cumActualPct / cumPlannedPct : null

  // ── Weekly progress (last week completions vs this week) ──
  const thisWeekStart = startOfWeek(today)
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 86_400_000)
  const thisWeekCompleted = workPackages.filter((w) => {
    if (!w.completed_at) return false
    const d = new Date(w.completed_at)
    return d >= thisWeekStart && d < new Date(thisWeekStart.getTime() + 7 * 86_400_000)
  }).length
  const lastWeekCompleted = workPackages.filter((w) => {
    if (!w.completed_at) return false
    const d = new Date(w.completed_at)
    return d >= lastWeekStart && d < thisWeekStart
  }).length
  const weeklyProgressPct = totalWp > 0
    ? ((thisWeekCompleted - lastWeekCompleted) / totalWp) * 100
    : 0

  // ── Schedule ──
  const startDate = project.start_date ? new Date(project.start_date) : null
  const endDate = project.target_end_date ? new Date(project.target_end_date) : null
  const elapsedDays = startDate ? diffDays(startDate, today) : null
  const totalDays = startDate && endDate ? diffDays(startDate, endDate) : null
  const remainingDays = endDate ? diffDays(today, endDate) : null

  // ── Risks ──
  const openRisks = risks.filter((r) => r.status !== 'closed')
  const criticalRisks = openRisks.filter((r) => r.score >= 15).length
  const highRisks = openRisks.filter((r) => r.score >= 8 && r.score < 15).length
  const moderateRisks = openRisks.filter((r) => r.score < 8).length
  const reviewCutoff = new Date(today.getTime() - 7 * 86_400_000)
  const overdueRiskReviews = openRisks.filter(
    (r) => !r.last_review_date || new Date(r.last_review_date) < reviewCutoff
  ).length

  // ── RAG ──
  let ragStatus: 'red' | 'amber' | 'green' = 'green'
  const overduePct = totalWp > 0 ? overdueWp / totalWp : 0
  if ((spi !== null && spi < 0.9) || overduePct > 0.2 || criticalRisks > 0) {
    ragStatus = 'red'
  } else if ((spi !== null && spi < 0.95) || overduePct > 0.1 || overdueRiskReviews > 0) {
    ragStatus = 'amber'
  }

  // ── EVM ──
  const bac = project.budget ?? null
  const pv = bac !== null ? bac * cumPlannedPct : null
  const ev = bac !== null ? bac * cumActualPct : null
  const sv = pv !== null && ev !== null ? ev - pv : null
  const eac = bac !== null && spi !== null && spi > 0 ? bac / spi : null

  // ── Sparkline (last 6 weeks) ──
  const sparkline: WeeklyBar[] = []
  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(thisWeekStart.getTime() - i * 7 * 86_400_000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000)
    const label = `S${getISOWeek(weekStart)}`
    const actual = workPackages.filter((w) => {
      if (!w.completed_at) return false
      const d = new Date(w.completed_at)
      return d >= weekStart && d < weekEnd
    }).length
    const planned = workPackages.filter((w) => {
      if (!w.due_date) return false
      const d = new Date(w.due_date)
      return d >= weekStart && d < weekEnd
    }).length
    sparkline.push({ week: label, actual, planned })
  }

  // ── Milestones (next 5 WPs with due_date, sorted) ──
  const milestones: MilestoneSummary[] = workPackages
    .filter((w) => w.due_date && w.status !== 'cancelled')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5)
    .map((w) => ({
      name: w.name,
      dueDate: w.due_date!,
      isOverdue: new Date(w.due_date!) < today && w.status !== 'completed',
      varianceDays: null,
    }))

  return {
    totalWp, completedWp, overdueWp,
    cumActualPct, cumPlannedPct, weeklyProgressPct,
    spi, elapsedDays, totalDays, remainingDays,
    criticalRisks, highRisks, moderateRisks, overdueRiskReviews,
    ragStatus, bac, pv, ev, sv, eac,
    sparkline, milestones,
  }
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
