'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, LayoutList, AlertTriangle,
  Users, FileText, BarChart3, ChevronLeft, ChevronRight, LogOut, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type SidebarItem = {
  icon: React.ElementType
  label: string
  href: string
  projectOnly?: boolean
}

const TOP_NAV: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
]

const PROJECT_NAV: SidebarItem[] = [
  { icon: FolderKanban, label: 'Kanban', href: 'kanban', projectOnly: true },
  { icon: LayoutList, label: 'Liste', href: 'list', projectOnly: true },
  { icon: AlertTriangle, label: 'Risques', href: 'risks', projectOnly: true },
  { icon: Users, label: 'Parties prenantes', href: 'stakeholders', projectOnly: true },
  { icon: FileText, label: 'Artefacts', href: 'artifacts', projectOnly: true },
  { icon: BarChart3, label: 'Rapports', href: 'reports', projectOnly: true },
]

type Props = {
  projectId?: string
  projectName?: string
}

export function AppSidebar({ projectId, projectName }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-slate-900 text-slate-100 transition-all duration-200',
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

      {/* Top navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {TOP_NAV.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}

        {/* Project section */}
        {projectId && (
          <>
            {!collapsed && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
                  {projectName ?? 'Projet'}
                </p>
              </div>
            )}
            {PROJECT_NAV.map((item) => (
              <NavItem
                key={item.href}
                item={{ ...item, href: `/projects/${projectId}/${item.href}` }}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* Bottom actions */}
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
  item,
  pathname,
  collapsed,
}: {
  item: SidebarItem & { href: string }
  pathname: string
  collapsed: boolean
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!collapsed && item.label}
    </Link>
  )
}
