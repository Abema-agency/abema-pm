interface CalloutProps {
  type?: 'summary' | 'warning' | 'info'
  children: React.ReactNode
}

export function Callout({ type = 'summary', children }: CalloutProps) {
  const styles = {
    summary: {
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
    },
    warning: {
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
    },
    info: {
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.2)',
    },
  }
  const s = styles[type]

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '8px',
      padding: '16px 20px',
      margin: '24px 0',
    }}>
      {children}
    </div>
  )
}
