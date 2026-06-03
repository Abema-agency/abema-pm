// components/layout/AppSidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bot, BarChart3,
  ChevronLeft, ChevronRight, LogOut, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Plan } from '@/types/copilote'

const PLAN_LABELS: Record<Plan, string> = {
  lite: 'Lite',
  solo: 'Solo',
  pro: 'Pro',
  team: 'Team',
}

const PLAN_UPGRADE: Record<Plan, string | null> = {
  lite: 'Passer en Solo →',
  solo: 'Passer en Pro →',
  pro: 'Passer en Team →',
  team: null,
}

type Props = {
  plan?: Plan
  projectId?: string
  projectName?: string
}

export function AppSidebar({ plan = 'lite', projectId, projectName }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const upgradeLabel = PLAN_UPGRADE[plan]

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-slate-900 text-slate-100 transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-slate-700', collapsed && 'justify-center')}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              <span className="text-blue-400">A</span>bema PM
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="text-blue-400 font-bold text-xl">A</Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} pathname={pathname} collapsed={collapsed} />
        <NavItem href="/dashboard/copilote" label="Copilote IA" icon={Bot} pathname={pathname} collapsed={collapsed} />
        {plan === 'team' && (
          <NavItem href="/dashboard/reports" label="Rapports" icon={BarChart3} pathname={pathname} collapsed={collapsed} />
        )}

        {/* Project sub-nav */}
        {projectId && !collapsed && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
              {projectName ?? 'Projet'}
            </p>
          </div>
        )}
        {projectId && (
          <>
            <NavItem href={`/dashboard/projects/${projectId}`} label="Tableau de bord" icon={LayoutDashboard} pathname={pathname} collapsed={collapsed} />
            <NavItem href={`/projects/${projectId}/kanban`} label="Kanban" icon={TrendingUp} pathname={pathname} collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* Plan badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Plan</span>
            <span className="text-xs font-bold text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">
              {PLAN_LABELS[plan]}
            </span>
          </div>
          {upgradeLabel && (
            <Link href="/pricing" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1 block">
              {upgradeLabel}
            </Link>
          )}
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-slate-700 py-2">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Déconnexion'}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 w-full border-t border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label={collapsed ? 'Déplier la barre' : 'Replier la barre'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}

function NavItem({
  href, label, icon: Icon, pathname, collapsed,
}: {
  href: string
  label: string
  icon: React.ElementType
  pathname: string
  collapsed: boolean
}) {
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        collapsed && 'justify-center px-0',
        active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && label}
    </Link>
  )
}
