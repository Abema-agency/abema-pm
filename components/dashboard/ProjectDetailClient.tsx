'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectDashboard } from './ProjectDashboard'
import { WorkPackagesTab } from '@/components/project/WorkPackagesTab'
import { RisksTab } from '@/components/project/RisksTab'
import { StakeholdersTab } from '@/components/project/StakeholdersTab'
import { CopiloteIA } from '@/components/copilote/CopiloteIA'
import type { Project } from '@/types/project'
import type { ProjectMetrics } from '@/lib/dashboard/metrics'

type Tab = 'dashboard' | 'workpackages' | 'risks' | 'stakeholders' | 'copilote'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard',    label: 'Tableau de bord' },
  { id: 'workpackages', label: 'Work Packages' },
  { id: 'risks',        label: 'Risques' },
  { id: 'stakeholders', label: 'Parties prenantes' },
  { id: 'copilote',     label: 'Copilote' },
]

interface ProjectDetailClientProps {
  project: Project
  metrics: ProjectMetrics
}

export function ProjectDetailClient({ project, metrics }: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-white px-4 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard'    && <ProjectDashboard project={project} metrics={metrics} />}
        {activeTab === 'workpackages' && <WorkPackagesTab projectId={project.id} />}
        {activeTab === 'risks'        && <RisksTab projectId={project.id} />}
        {activeTab === 'stakeholders' && <StakeholdersTab projectId={project.id} />}
        {activeTab === 'copilote'     && (
          <div className="h-full bg-white">
            <CopiloteIA projectId={project.id} activeAgent="assistant" />
          </div>
        )}
      </div>
    </div>
  )
}
