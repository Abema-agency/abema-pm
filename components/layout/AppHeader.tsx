'use client'

import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAIStore } from '@/store/useAIStore'

type Props = {
  title: string
  breadcrumb?: { label: string; href?: string }[]
}

export function AppHeader({ title, breadcrumb }: Props) {
  const { togglePanel } = useAIStore()

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white">
      <div>
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-sm text-slate-500">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {item.href ? (
                  <a href={item.href} className="hover:text-slate-900 transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-slate-900 font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={togglePanel}
        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Bot className="w-4 h-4" />
        Copilote IA
      </Button>
    </header>
  )
}
