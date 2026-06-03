// components/dashboard/Sparkline.tsx
import type { WeeklyBar } from '@/lib/dashboard/metrics'

interface SparklineProps {
  data: WeeklyBar[]
}

export function Sparkline({ data }: SparklineProps) {
  const maxVal = Math.max(...data.flatMap((d) => [d.planned, d.actual]), 1)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-2">
      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">
        Tendance 6 semaines — planifié vs réel
      </p>
      <div className="flex gap-1 items-end h-10">
        {data.map((bar, i) => {
          const plannedH = Math.max(2, Math.round((bar.planned / maxVal) * 36))
          const actualH = Math.max(2, Math.round((bar.actual / maxVal) * 36))
          return (
            <div key={i} className="flex gap-0.5 items-end flex-1">
              <div
                className="flex-1 border border-slate-600 rounded-t"
                style={{ height: plannedH, background: 'transparent' }}
                title={`Planifié: ${bar.planned}`}
              />
              <div
                className="flex-1 bg-blue-500 rounded-t"
                style={{ height: actualH }}
                title={`Réel: ${bar.actual}`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 mt-1">
        {data.map((bar, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-slate-600 font-mono">
            {bar.week}
          </div>
        ))}
      </div>
    </div>
  )
}
