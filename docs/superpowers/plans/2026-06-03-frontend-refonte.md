# Frontend Refonte — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the three priority gaps (Copilote agent sidebar + plan gating, Parsons-style project dashboard, onboarding PMBOK tailoring) without rebuilding what works.

**Architecture:** Shared layer first (types → plan API → hook → sidebar), then UI per priority. Server components fetch data and pass metrics as props; client components handle interactivity. All new components follow the existing dark navy (`#0F172A`/`#1E293B`) theme except the onboarding wizard which uses light warm.

**Tech Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · shadcn/ui · Supabase (SSR) · Anthropic SDK · Zustand

**Spec:** `docs/superpowers/specs/2026-06-03-frontend-refonte-design.md`

**Verification command (no test framework):** `npx tsc --noEmit && npm run lint`

---

## Phase 0 — Shared Infrastructure

---

### Task 1: Update `types/copilote.ts`

**Files:**
- Modify: `types/copilote.ts`

- [ ] **Step 1: Replace the file contents**

```typescript
// types/copilote.ts
export type Plan = 'lite' | 'solo' | 'pro' | 'team'

export type AgentId = 'assistant' | 'artifacts' | 'risks' | 'decision' | 'coach' | 'executive'

export type AgentConfig = {
  id: AgentId
  label: string
  description: string
  systemPromptKey: string
}

export const AGENTS: AgentConfig[] = [
  { id: 'assistant',  label: 'Assistant projet',     description: 'Questions générales sur votre projet', systemPromptKey: 'assistant' },
  { id: 'artifacts',  label: 'Générateur artefacts',  description: 'Créer charte, RACI, PMP…',             systemPromptKey: 'artifacts' },
  { id: 'risks',      label: 'Analyse risques',       description: 'Identifier et évaluer les risques',     systemPromptKey: 'risks' },
  { id: 'decision',   label: 'Copilote décisionnel',  description: 'Arbitrer les choix complexes',          systemPromptKey: 'decision' },
  { id: 'coach',      label: 'Coach PM',              description: 'Monter en compétence PMBOK 8',          systemPromptKey: 'coach' },
  { id: 'executive',  label: 'Rapport exécutif',      description: 'Synthèse pour dirigeants',              systemPromptKey: 'executive' },
]

export type PlanLimits = {
  agents: AgentId[]
  model: string
  dailyRequests: number       // -1 = unlimited
  aiMessagesPerMonth: number  // -1 = unlimited
  workflowTriggersPerMonth: number
  maxTokensPerRequest: number
  webhookTriggers: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  lite: {
    agents: ['assistant'],
    model: 'claude-haiku-4-5-20251001',
    dailyRequests: 5,
    aiMessagesPerMonth: 300,
    workflowTriggersPerMonth: 0,
    maxTokensPerRequest: 200,
    webhookTriggers: false,
  },
  solo: {
    agents: ['assistant', 'artifacts', 'risks'],
    model: 'claude-sonnet-4-6',
    dailyRequests: 50,
    aiMessagesPerMonth: 1500,
    workflowTriggersPerMonth: 0,
    maxTokensPerRequest: 500,
    webhookTriggers: false,
  },
  pro: {
    agents: ['assistant', 'artifacts', 'risks', 'decision', 'coach'],
    model: 'claude-opus-4-5',
    dailyRequests: 200,
    aiMessagesPerMonth: 6000,
    workflowTriggersPerMonth: 0,
    maxTokensPerRequest: 1000,
    webhookTriggers: false,
  },
  team: {
    agents: ['assistant', 'artifacts', 'risks', 'decision', 'coach', 'executive'],
    model: 'claude-opus-4-5',
    dailyRequests: -1,
    aiMessagesPerMonth: -1,
    workflowTriggersPerMonth: -1,
    maxTokensPerRequest: 2000,
    webhookTriggers: true,
  },
}

export type Feature = 'ai_chat' | 'status_report' | 'risk_alert' | 'project_analysis'

export type CopiloteMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export type WorkflowType = 'status_report' | 'risk_alert'

export type WorkflowTriggerResponse = {
  success: boolean
  message?: string
  error?: string
}

export type AiAgentRequest = {
  messages: CopiloteMessage[]
  projectId?: string
  agentId?: AgentId
  feature: Feature
}

export type CopiloteMetrics = {
  aiMessagesUsed: number
  workflowsTriggered: number
  plan: Plan
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```
Expected: no errors. If you see `Property 'agents' does not exist on type 'PlanLimits'`, the old `PlanLimits` import somewhere didn't update — search for other files importing `PlanLimits` and check they still compile.

- [ ] **Step 3: Commit**

```bash
git add types/copilote.ts
git commit -m "feat: add AgentId/AgentConfig/AGENTS, update PLAN_LIMITS with per-plan models"
```

---

### Task 2: Create `app/api/user/plan/route.ts`

**Files:**
- Create: `app/api/user/plan/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/user/plan/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Plan } from '@/types/copilote'

function resolvePlan(raw: string | null | undefined): Plan {
  const v = (raw ?? '').toLowerCase()
  if (v === 'solo') return 'solo'
  if (v === 'pro') return 'pro'
  if (v === 'team') return 'team'
  return 'lite'
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  let orgPlan: string | null = null
  let orgId: string | null = profile?.org_id ?? null

  if (orgId) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', orgId)
      .single()
    orgPlan = org?.plan ?? null
  }

  return NextResponse.json(
    { plan: resolvePlan(orgPlan), orgId },
    { headers: { 'Cache-Control': 'private, max-age=60' } }
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/user/plan/route.ts
git commit -m "feat: add GET /api/user/plan — lightweight cached plan endpoint"
```

---

### Task 3: Update `hooks/useAiAgent.ts`

**Files:**
- Modify: `hooks/useAiAgent.ts`

- [ ] **Step 1: Replace file contents**

```typescript
// hooks/useAiAgent.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CopiloteMessage, WorkflowType, WorkflowTriggerResponse, AgentId, Plan } from '@/types/copilote'
import { PLAN_LIMITS } from '@/types/copilote'

export function useAiAgent(projectId?: string) {
  const [messages, setMessages] = useState<CopiloteMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<AgentId>('assistant')
  const [currentPlan, setCurrentPlan] = useState<Plan>('lite')
  const [planLoaded, setPlanLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/user/plan')
      .then((r) => r.json())
      .then((d: { plan: Plan }) => {
        setCurrentPlan(d.plan)
        setPlanLoaded(true)
      })
      .catch(() => setPlanLoaded(true))
  }, [])

  function canUseAgent(agentId: AgentId): boolean {
    return (PLAN_LIMITS[currentPlan].agents as AgentId[]).includes(agentId)
  }

  function getRemainingQuota(): number | null {
    const limit = PLAN_LIMITS[currentPlan].dailyRequests
    return limit === -1 ? null : limit
  }

  const sendMessage = useCallback(async (content: string, agentId?: AgentId) => {
    const resolvedAgent = agentId ?? activeAgent
    const userMsg: CopiloteMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)
    setError(null)

    const assistantMsg: CopiloteMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          projectId,
          agentId: resolvedAgent,
          feature: 'ai_chat',
        }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error ?? 'Erreur IA')
      }

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...assistantMsg, content: accumulated }
          return updated
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...assistantMsg, content: `❌ ${msg}` }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }, [messages, projectId, activeAgent])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    clearMessages,
    activeAgent,
    setActiveAgent,
    currentPlan,
    planLoaded,
    canUseAgent,
    getRemainingQuota,
  }
}

export function useWorkflowTrigger() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<WorkflowTriggerResponse | null>(null)

  const trigger = useCallback(async (
    workflowType: WorkflowType,
    projectId: string,
    data?: Record<string, unknown>,
  ): Promise<WorkflowTriggerResponse> => {
    setIsLoading(true)
    setResult(null)

    try {
      const endpoint = workflowType === 'status_report'
        ? '/api/webhooks/status-report'
        : '/api/webhooks/risk-alert'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, data }),
      })

      const json = await response.json() as WorkflowTriggerResponse
      setResult(json)
      return json
    } catch (err) {
      const error: WorkflowTriggerResponse = {
        success: false,
        error: err instanceof Error ? err.message : 'Erreur réseau',
      }
      setResult(error)
      return error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { trigger, isLoading, result }
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useAiAgent.ts
git commit -m "feat: extend useAiAgent with canUseAgent, activeAgent, currentPlan, getRemainingQuota"
```

---

### Task 4: Update `app/api/ai-agent/route.ts`

**Files:**
- Modify: `app/api/ai-agent/route.ts` lines 1–150

- [ ] **Step 1: Update the POST handler — change model lookup and log agentId**

The only two changes are:
1. `limits.model` already reads from updated `PLAN_LIMITS` (no code change needed — the type update in Task 1 handles it)
2. Log `agentId` in `ai_interactions.interaction_type`

Find and replace this block:

```typescript
// OLD (around line 124–130):
  void supabase.from('ai_interactions').insert({
    project_id: projectId ?? null,
    user_id: user.id,
    interaction_type: 'chat',
    prompt_preview: messages[messages.length - 1]?.content?.slice(0, 100) ?? '',
  })
```

Replace with:

```typescript
  const { agentId } = body
  void supabase.from('ai_interactions').insert({
    project_id: projectId ?? null,
    user_id: user.id,
    interaction_type: agentId ? `chat:${agentId}` : 'chat',
    prompt_preview: messages[messages.length - 1]?.content?.slice(0, 100) ?? '',
  })
```

- [ ] **Step 2: Also update the destructuring of `body` (line ~77) to include `agentId`**

Find:
```typescript
  const { messages, projectId } = body
```

Replace with:
```typescript
  const { messages, projectId, agentId } = body
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/api/ai-agent/route.ts
git commit -m "feat: log agentId in ai_interactions, models updated via PLAN_LIMITS"
```

---

### Task 5: Update `components/layout/AppSidebar.tsx` + `app/(app)/layout.tsx`

**Files:**
- Modify: `components/layout/AppSidebar.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Replace `AppSidebar.tsx`**

```typescript
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
```

- [ ] **Step 2: Update `app/(app)/layout.tsx` to fetch plan and pass to sidebar**

```typescript
// app/(app)/layout.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AICopilotPanel } from '@/components/ai/AICopilotPanel'
import { Toaster } from '@/components/ui/sonner'
import Providers from './providers'
import type { Plan } from '@/types/copilote'

function resolvePlan(raw: string | null | undefined): Plan {
  const v = (raw ?? '').toLowerCase()
  if (v === 'solo') return 'solo'
  if (v === 'pro') return 'pro'
  if (v === 'team') return 'team'
  return 'lite'
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  let plan: Plan = 'lite'
  if (profile?.org_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', profile.org_id)
      .single()
    plan = resolvePlan(org?.plan)
  }

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AppSidebar plan={plan} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <AICopilotPanel />
        <Toaster />
      </div>
    </Providers>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/AppSidebar.tsx app/(app)/layout.tsx
git commit -m "feat: add Copilote IA + Rapports links to sidebar, plan badge with upgrade CTA"
```

---

## Phase 1 — Copilote IA

---

### Task 6: Create `components/copilote/AgentSelector.tsx`

**Files:**
- Create: `components/copilote/AgentSelector.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/copilote/AgentSelector.tsx
'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AGENTS, PLAN_LIMITS } from '@/types/copilote'
import type { AgentId, Plan } from '@/types/copilote'

const PLAN_LABELS: Record<Plan, string> = { lite: 'Lite', solo: 'Solo', pro: 'Pro', team: 'Team' }

function getPlanRequired(agentId: AgentId): Plan | null {
  const plans: Plan[] = ['lite', 'solo', 'pro', 'team']
  for (const p of plans) {
    if ((PLAN_LIMITS[p].agents as AgentId[]).includes(agentId)) return p
  }
  return null
}

interface AgentSelectorProps {
  currentPlan: Plan
  activeAgent: AgentId
  onSelect: (id: AgentId) => void
  dailyUsed: number
}

export function AgentSelector({ currentPlan, activeAgent, onSelect, dailyUsed }: AgentSelectorProps) {
  const allowedAgents = PLAN_LIMITS[currentPlan].agents as AgentId[]
  const dailyLimit = PLAN_LIMITS[currentPlan].dailyRequests

  const usedPct = dailyLimit === -1 ? 5 : Math.min(100, Math.round((dailyUsed / dailyLimit) * 100))
  const barColor = usedPct >= 90 ? 'bg-red-500' : usedPct >= 70 ? 'bg-amber-500' : 'bg-blue-500'

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-60 flex-shrink-0">
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Agents — Plan {PLAN_LABELS[currentPlan]}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-2">
        {AGENTS.map((agent) => {
          const unlocked = allowedAgents.includes(agent.id)
          const planRequired = getPlanRequired(agent.id)

          if (unlocked) {
            return (
              <button
                key={agent.id}
                onClick={() => onSelect(agent.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-md border transition-colors',
                  activeAgent === agent.id
                    ? 'border-blue-500 bg-blue-950/60 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                )}
              >
                <p className="text-xs font-semibold leading-tight">{agent.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{agent.description}</p>
              </button>
            )
          }

          return (
            <div
              key={agent.id}
              className="px-3 py-2.5 rounded-md border border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed"
              title={`Disponible en plan ${PLAN_LABELS[planRequired ?? 'pro']}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 leading-tight">{agent.label}</p>
                <div className="flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-600" />
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-800 px-1 py-0.5 rounded">
                    {PLAN_LABELS[planRequired ?? 'pro']}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quota bar */}
      <div className="px-3 py-3 border-t border-slate-700">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{dailyUsed} utilisés</span>
          <span>{dailyLimit === -1 ? '∞' : dailyLimit} / jour</span>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', barColor)} style={{ width: `${usedPct}%` }} />
        </div>
        {currentPlan !== 'team' && (
          <Link href="/pricing" className="text-[10px] text-slate-600 hover:text-slate-400 mt-1.5 block transition-colors">
            Augmenter le quota →
          </Link>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/copilote/AgentSelector.tsx
git commit -m "feat: AgentSelector sidebar with plan-gated agent list and quota bar"
```

---

### Task 7: Update `components/copilote/CopiloteIA.tsx`

**Files:**
- Modify: `components/copilote/CopiloteIA.tsx`

- [ ] **Step 1: Add `activeAgent` prop and show it in the chat header**

Find the interface and component signature:

```typescript
// OLD:
interface CopiloteIAProps {
  projectId?: string
}

export function CopiloteIA({ projectId }: CopiloteIAProps) {
  const { messages, sendMessage, isStreaming, error, clearMessages } = useAiAgent(projectId)
```

Replace with:

```typescript
// NEW:
import type { AgentId } from '@/types/copilote'
import { AGENTS, PLAN_LIMITS } from '@/types/copilote'

interface CopiloteIAProps {
  projectId?: string
  activeAgent?: AgentId
}

export function CopiloteIA({ projectId, activeAgent = 'assistant' }: CopiloteIAProps) {
  const { messages, sendMessage, isStreaming, error, clearMessages, currentPlan } = useAiAgent(projectId)
  const agentConfig = AGENTS.find((a) => a.id === activeAgent)
  const modelName = PLAN_LIMITS[currentPlan].model
```

- [ ] **Step 2: Add a chat header showing active agent + model**

Find the empty state div (`messages.length === 0`) section. Add the header just before the messages div:

```typescript
    <div className="flex flex-col h-full min-h-0">
      {/* Agent header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50/50 flex-shrink-0">
        <span className="text-xs font-semibold text-slate-700">{agentConfig?.label ?? 'Copilote'}</span>
        <span className="text-[10px] text-slate-400 font-mono">{modelName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
```

- [ ] **Step 3: Pass `activeAgent` to `sendMessage`**

In `handleSubmit`:

```typescript
// OLD:
    void sendMessage(trimmed)
// NEW:
    void sendMessage(trimmed, activeAgent)
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/copilote/CopiloteIA.tsx
git commit -m "feat: CopiloteIA shows active agent name and model in header"
```

---

### Task 8: Update `components/copilote/WorkflowTriggers.tsx` — plan gating

**Files:**
- Modify: `components/copilote/WorkflowTriggers.tsx`

- [ ] **Step 1: Add `plan` prop and return null if not team**

Find the interface and replace:

```typescript
// OLD:
interface WorkflowTriggersProps {
  projectId: string
}

export function WorkflowTriggers({ projectId }: WorkflowTriggersProps) {
```

Replace with:

```typescript
import type { Plan } from '@/types/copilote'

interface WorkflowTriggersProps {
  projectId: string
  plan: Plan
}

export function WorkflowTriggers({ projectId, plan }: WorkflowTriggersProps) {
  if (plan !== 'team') return null
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/copilote/WorkflowTriggers.tsx
git commit -m "feat: WorkflowTriggers gated to team plan only"
```

---

### Task 9: Update `app/(app)/dashboard/copilote/page.tsx`

**Files:**
- Modify: `app/(app)/dashboard/copilote/page.tsx`

- [ ] **Step 1: Replace file with new layout (AgentSelector sidebar + CopiloteIA chat)**

```typescript
// app/(app)/dashboard/copilote/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { CopilotePageClient } from '@/components/copilote/CopilotePageClient'
import type { Plan } from '@/types/copilote'

function resolvePlan(raw: string | null | undefined): Plan {
  const v = (raw ?? '').toLowerCase()
  if (v === 'solo') return 'solo'
  if (v === 'pro') return 'pro'
  if (v === 'team') return 'team'
  return 'lite'
}

export default async function CopilotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  let plan: Plan = 'lite'
  if (profile?.org_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', profile.org_id)
      .single()
    plan = resolvePlan(org?.plan)
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: dailyUsed } = await supabase
    .from('ai_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Copilote IA" />
      <CopilotePageClient plan={plan} dailyUsed={dailyUsed ?? 0} />
    </div>
  )
}
```

- [ ] **Step 2: Create `components/copilote/CopilotePageClient.tsx`**

```typescript
// components/copilote/CopilotePageClient.tsx
'use client'

import { useState } from 'react'
import { AgentSelector } from './AgentSelector'
import { CopiloteIA } from './CopiloteIA'
import { WorkflowTriggers } from './WorkflowTriggers'
import type { AgentId, Plan } from '@/types/copilote'

interface CopilotePageClientProps {
  plan: Plan
  dailyUsed: number
  projectId?: string
}

export function CopilotePageClient({ plan, dailyUsed, projectId }: CopilotePageClientProps) {
  const [activeAgent, setActiveAgent] = useState<AgentId>('assistant')

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <AgentSelector
        currentPlan={plan}
        activeAgent={activeAgent}
        onSelect={setActiveAgent}
        dailyUsed={dailyUsed}
      />
      <div className="flex-1 min-h-0 flex flex-col bg-white">
        <CopiloteIA projectId={projectId} activeAgent={activeAgent} />
      </div>
      {plan === 'team' && projectId && (
        <div className="w-56 flex-shrink-0 bg-slate-50 border-l p-4">
          <WorkflowTriggers projectId={projectId} plan={plan} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/copilote/page.tsx components/copilote/CopilotePageClient.tsx
git commit -m "feat: Copilote page — agent selector sidebar with plan gating"
```

---

## Phase 2 — Dashboard

---

### Task 10: Create `lib/dashboard/metrics.ts`

**Files:**
- Create: `lib/dashboard/metrics.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/dashboard/metrics.ts
git commit -m "feat: computeProjectMetrics — SPI, RAG, EVM, sparkline, milestones"
```

---

### Task 11: Create `components/dashboard/KpiCards.tsx`

**Files:**
- Create: `components/dashboard/KpiCards.tsx`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/KpiCards.tsx
git commit -m "feat: KpiCards — 4 dark navy metric cards with RAG colors"
```

---

### Task 12: Update `components/project/ProjectCard.tsx` + `app/(app)/dashboard/page.tsx`

**Files:**
- Modify: `components/project/ProjectCard.tsx`
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Update `ProjectCard.tsx` — link to `/dashboard/projects/[id]`, add RAG dot**

Replace the `Link href`:
```typescript
// OLD:
    <Link href={`/projects/${project.id}/kanban`}>
// NEW:
    <Link href={`/dashboard/projects/${project.id}`}>
```

Add RAG dot next to project name (in `CardHeader`, after the project name `h3`):

```typescript
// Add ragStatus prop to Props type:
type Props = {
  project: Project
  ragStatus?: 'red' | 'amber' | 'green'
}

export function ProjectCard({ project, ragStatus }: Props) {
```

In the `CardHeader`, add RAG dot after the `h3`:

```typescript
<div className="flex items-start justify-between gap-2">
  <div className="flex items-center gap-2 min-w-0">
    {ragStatus && (
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', {
        'bg-red-500': ragStatus === 'red',
        'bg-amber-500': ragStatus === 'amber',
        'bg-green-500': ragStatus === 'green',
      })} />
    )}
    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
      {project.name}
    </h3>
  </div>
  <Badge ...>
```

- [ ] **Step 2: Update `app/(app)/dashboard/page.tsx` — add KPI cards**

```typescript
// app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project/ProjectCard'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { Plus, FolderOpen } from 'lucide-react'
import type { Project, WorkPackage, Risk } from '@/types/project'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  const projectIds = (projects ?? []).map((p) => p.id)

  // Fetch cross-project WP and risk stats
  let overdueWp = 0
  let criticalRisks = 0

  if (projectIds.length > 0) {
    const today = new Date().toISOString().split('T')[0]

    const { count: overdue } = await supabase
      .from('work_packages')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .lt('due_date', today)
      .not('status', 'in', '(completed,cancelled)')

    const { data: riskData } = await supabase
      .from('risks')
      .select('score, status')
      .in('project_id', projectIds)
      .neq('status', 'closed')

    overdueWp = overdue ?? 0
    criticalRisks = (riskData ?? []).filter((r: Pick<Risk, 'score' | 'status'>) => r.score >= 15).length
  }

  const activeProjects = (projects ?? []).filter((p) => p.status === 'active').length
  const ragStatus = criticalRisks > 0 || overdueWp > Math.max(1, projectIds.length * 2)
    ? 'red'
    : overdueWp > 0
    ? 'amber'
    : 'green'

  return (
    <div>
      <AppHeader title="Mes projets" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-sm">
            {projects?.length ?? 0} projet{(projects?.length ?? 0) > 1 ? 's' : ''} actif{(projects?.length ?? 0) > 1 ? 's' : ''}
          </p>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Link>
          </Button>
        </div>

        {(projects?.length ?? 0) > 0 && (
          <KpiCards
            activeProjects={activeProjects}
            overdueWp={overdueWp}
            criticalRisks={criticalRisks}
            ragStatus={ragStatus}
          />
        )}

        {!projects?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
            <h2 className="text-lg font-medium text-slate-700 mb-2">Aucun projet pour l'instant</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              Créez votre premier projet pour commencer à gérer vos livrables, risques et parties prenantes.
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier projet
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project as Project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add components/project/ProjectCard.tsx app/\(app\)/dashboard/page.tsx components/dashboard/KpiCards.tsx
git commit -m "feat: dashboard KPI cards, ProjectCard links to /dashboard/projects/[id]"
```

---

### Task 13: Extract tab components

**Files:**
- Create: `components/project/WorkPackagesTab.tsx`
- Create: `components/project/RisksTab.tsx`
- Create: `components/project/StakeholdersTab.tsx`

- [ ] **Step 1: Create `WorkPackagesTab.tsx`** (wraps existing `ListClient`)

```typescript
// components/project/WorkPackagesTab.tsx
'use client'

export { ListClient as WorkPackagesTab } from '@/app/(app)/projects/[id]/list/client'
```

Note: if that re-export causes a path issue due to the `(app)` segment, create a thin wrapper instead:

```typescript
// components/project/WorkPackagesTab.tsx
'use client'

import { ListClient } from '@/app/(app)/projects/[id]/list/client'

export function WorkPackagesTab({ projectId }: { projectId: string }) {
  return <ListClient projectId={projectId} />
}
```

- [ ] **Step 2: Create `RisksTab.tsx`**

```typescript
// components/project/RisksTab.tsx
'use client'

import { RisksClient } from '@/app/(app)/projects/[id]/risks/client'

export function RisksTab({ projectId }: { projectId: string }) {
  return <RisksClient projectId={projectId} />
}
```

- [ ] **Step 3: Create `StakeholdersTab.tsx`**

```typescript
// components/project/StakeholdersTab.tsx
'use client'

import { StakeholdersClient } from '@/app/(app)/projects/[id]/stakeholders/client'

export function StakeholdersTab({ projectId }: { projectId: string }) {
  return <StakeholdersClient projectId={projectId} />
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/project/WorkPackagesTab.tsx components/project/RisksTab.tsx components/project/StakeholdersTab.tsx
git commit -m "feat: extract WorkPackagesTab, RisksTab, StakeholdersTab for reuse in project detail"
```

---

### Task 14: Create `components/dashboard/Sparkline.tsx`

**Files:**
- Create: `components/dashboard/Sparkline.tsx`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/Sparkline.tsx
git commit -m "feat: Sparkline — 6-week trend bars (outlined planned, filled actual)"
```

---

### Task 15: Create `components/dashboard/ProjectDashboard.tsx`

**Files:**
- Create: `components/dashboard/ProjectDashboard.tsx`

- [ ] **Step 1: Create the file**

```typescript
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

const RAG_DOT: Record<string, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
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
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/ProjectDashboard.tsx components/dashboard/Sparkline.tsx
git commit -m "feat: ProjectDashboard — Parsons-style executive view with EVM, milestones, sparkline"
```

---

### Task 16: Create the unified project detail page

**Files:**
- Create: `components/dashboard/ProjectDetailClient.tsx`
- Modify: `app/(app)/dashboard/projects/[id]/page.tsx`

- [ ] **Step 1: Create `ProjectDetailClient.tsx`**

```typescript
// components/dashboard/ProjectDetailClient.tsx
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
```

- [ ] **Step 2: Replace `app/(app)/dashboard/projects/[id]/page.tsx`**

```typescript
// app/(app)/dashboard/projects/[id]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { ProjectDetailClient } from '@/components/dashboard/ProjectDetailClient'
import { computeProjectMetrics } from '@/lib/dashboard/metrics'
import type { Project, WorkPackage, Risk } from '@/types/project'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const [{ data: workPackages }, { data: risks }] = await Promise.all([
    supabase.from('work_packages').select('*').eq('project_id', id),
    supabase.from('risks').select('*').eq('project_id', id),
  ])

  const metrics = computeProjectMetrics(
    project as Project,
    (workPackages ?? []) as WorkPackage[],
    (risks ?? []) as Risk[],
  )

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={project.name} />
      <ProjectDetailClient project={project as Project} metrics={metrics} />
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/ProjectDetailClient.tsx app/\(app\)/dashboard/projects/\[id\]/page.tsx
git commit -m "feat: unified project detail page — 5 tabs with Parsons dashboard as default"
```

---

## Phase 3 — Onboarding

---

### Task 17: Update `store/useOnboardingStore.ts`

**Files:**
- Modify: `store/useOnboardingStore.ts`

- [ ] **Step 1: Add PMBOK tailoring fields**

```typescript
// store/useOnboardingStore.ts
'use client'

import { create } from 'zustand'
import type { UserProfileType, ProjectApproach, ProjectSector } from '@/types/project'

export type TailoringAnswers = {
  teamSize: '1-3' | '4-10' | '10+' | null
  scopeDefined: 'fixed' | 'partial' | 'evolving' | null
  formalDeliverables: 'yes' | 'no' | null
  fixedBudget: 'yes' | 'no' | null
  deliveryFrequency: 'milestones' | 'continuous' | 'both' | null
}

type OnboardingData = {
  profileType: UserProfileType | null
  firstProjectName: string
  firstProjectSector: ProjectSector | null
  firstProjectApproach: ProjectApproach | null
  tailoring: TailoringAnswers
}

type OnboardingStore = {
  step: number
  data: OnboardingData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (data: Partial<OnboardingData>) => void
  updateTailoring: (t: Partial<TailoringAnswers>) => void
  reset: () => void
}

const INITIAL_TAILORING: TailoringAnswers = {
  teamSize: null,
  scopeDefined: null,
  formalDeliverables: null,
  fixedBudget: null,
  deliveryFrequency: null,
}

const INITIAL_DATA: OnboardingData = {
  profileType: null,
  firstProjectName: '',
  firstProjectSector: null,
  firstProjectApproach: null,
  tailoring: INITIAL_TAILORING,
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  data: INITIAL_DATA,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
  updateTailoring: (t) => set((state) => ({
    data: { ...state.data, tailoring: { ...state.data.tailoring, ...t } }
  })),
  reset: () => set({ step: 1, data: INITIAL_DATA }),
}))

export function recommendApproach(t: TailoringAnswers): ProjectApproach {
  let predictiveScore = 0
  let agileScore = 0

  if (t.scopeDefined === 'fixed') predictiveScore += 2
  if (t.scopeDefined === 'evolving') agileScore += 2
  if (t.formalDeliverables === 'yes') predictiveScore += 1
  if (t.fixedBudget === 'yes') predictiveScore += 1
  if (t.deliveryFrequency === 'milestones') predictiveScore += 1
  if (t.deliveryFrequency === 'continuous') agileScore += 2
  if (t.teamSize === '10+') agileScore += 1

  if (predictiveScore > agileScore + 1) return 'predictive'
  if (agileScore > predictiveScore + 1) return 'agile'
  return 'hybrid'
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add store/useOnboardingStore.ts
git commit -m "feat: onboarding store — PMBOK tailoring answers + recommendApproach()"
```

---

### Task 18: Replace `app/(app)/onboarding/page.tsx`

**Files:**
- Modify: `app/(app)/onboarding/page.tsx`

- [ ] **Step 1: Replace with 4-step light-theme wizard**

```typescript
// app/(app)/onboarding/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore, recommendApproach } from '@/store/useOnboardingStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { UserProfileType, ProjectSector } from '@/types/project'
import type { TailoringAnswers } from '@/store/useOnboardingStore'

const PROFILES = [
  { value: 'artisan' as UserProfileType,     label: 'Artisan / TPE',  desc: 'Chantiers, missions, commandes concrètes' },
  { value: 'pm_advanced' as UserProfileType, label: 'Chef de projet', desc: 'Projets complexes, méthode PMBOK' },
  { value: 'sme_manager' as UserProfileType, label: 'Dirigeant PME',  desc: 'Pilotage multi-projets stratégiques' },
]

const SECTORS: { value: ProjectSector; label: string }[] = [
  { value: 'construction',       label: 'BTP / Construction' },
  { value: 'it_software',        label: 'IT / Logiciel' },
  { value: 'marketing_events',   label: 'Marketing / Événements' },
  { value: 'rd_innovation',      label: 'R&D / Innovation' },
  { value: 'transformation',     label: 'Transformation' },
  { value: 'product_launch',     label: 'Lancement produit' },
  { value: 'regulatory_public',  label: 'Réglementation / Public' },
  { value: 'other',              label: 'Autre' },
]

const APPROACHES = [
  { value: 'predictive' as const, label: 'Prédictif', desc: 'Périmètre fixé dès le début, livrables formels' },
  { value: 'agile' as const,      label: 'Agile',     desc: 'Livraisons continues, périmètre évolutif' },
  { value: 'hybrid' as const,     label: 'Hybride',   desc: 'Mix des deux selon les phases' },
]

const TAILORING_QUESTIONS: {
  key: keyof TailoringAnswers
  question: string
  options: { value: string; label: string }[]
}[] = [
  {
    key: 'teamSize',
    question: 'Taille de votre équipe projet ?',
    options: [{ value: '1-3', label: '1–3 personnes' }, { value: '4-10', label: '4–10 personnes' }, { value: '10+', label: '10+ personnes' }],
  },
  {
    key: 'scopeDefined',
    question: 'Le périmètre est-il défini dès le départ ?',
    options: [{ value: 'fixed', label: 'Oui, figé' }, { value: 'partial', label: 'Partiellement' }, { value: 'evolving', label: 'Non, évolutif' }],
  },
  {
    key: 'formalDeliverables',
    question: 'Votre client demande-t-il des livrables formels ?',
    options: [{ value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' }],
  },
  {
    key: 'fixedBudget',
    question: 'Avez-vous une contrainte de budget fixe ?',
    options: [{ value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' }],
  },
  {
    key: 'deliveryFrequency',
    question: 'À quelle fréquence livrez-vous ?',
    options: [{ value: 'milestones', label: 'Par jalons' }, { value: 'continuous', label: 'En continu' }, { value: 'both', label: 'Les deux' }],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { step, data, nextStep, prevStep, updateData, updateTailoring } = useOnboardingStore()
  const supabase = createClient()

  async function handleFinish() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const approach = data.firstProjectApproach ?? recommendApproach(data.tailoring)

    await supabase
      .from('profiles')
      .update({
        profile_type: data.profileType ?? 'artisan',
        onboarding_completed: true,
      } as { profile_type: UserProfileType; onboarding_completed: boolean })
      .eq('id', user.id)

    if (data.firstProjectName.trim()) {
      const { data: project } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          name: data.firstProjectName,
          sector: data.firstProjectSector ?? null,
          approach,
          status: 'active' as const,
          success_criteria: [],
          tailoring_answers: {},
        })
        .select()
        .single()

      if (project && 'id' in project) {
        window.location.href = `/dashboard/projects/${(project as { id: string }).id}`
        return
      }
    }

    window.location.href = '/dashboard'
  }

  const totalSteps = 4
  const recommended = recommendApproach(data.tailoring)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">A</span>bema PM
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configuration de votre espace · Étape {step}/{totalSteps}</p>
          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i + 1 === step ? 'w-5 bg-blue-600' : i + 1 < step ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quel est votre contexte ?</h2>
            <div className="space-y-2">
              {PROFILES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { updateData({ profileType: p.value }); nextStep() }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border transition-colors',
                    data.profileType === p.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium text-sm text-gray-800">{p.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: First project ── */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Votre premier projet</h2>
            <p className="text-sm text-gray-400 mb-4">Vous pourrez ajouter tous les détails ensuite.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pname" className="text-sm text-gray-700">Nom du projet <span className="text-red-400">*</span></Label>
                <Input
                  id="pname"
                  value={data.firstProjectName}
                  onChange={(e) => updateData({ firstProjectName: e.target.value })}
                  placeholder="Ex: Rénovation cuisine Dubois"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Secteur</Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {SECTORS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateData({ firstProjectSector: s.value })}
                      className={cn(
                        'text-left px-3 py-2 rounded-md border text-xs transition-colors',
                        data.firstProjectSector === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={prevStep}>← Retour</Button>
                <Button
                  className="flex-1"
                  onClick={nextStep}
                  disabled={!data.firstProjectName.trim()}
                >
                  Continuer →
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-gray-400" onClick={() => { updateData({ firstProjectName: 'Mon premier projet' }); nextStep() }}>
                Passer cette étape
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: PMBOK tailoring ── */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Tailoring PMBOK 8</h2>
            <p className="text-sm text-gray-400 mb-4">5 questions rapides pour recommander votre approche.</p>
            <div className="space-y-4">
              {TAILORING_QUESTIONS.map((q) => (
                <div key={q.key}>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">{q.question}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateTailoring({ [q.key]: opt.value } as Partial<TailoringAnswers>)}
                        className={cn(
                          'px-3 py-1.5 rounded-md border text-xs font-medium transition-colors',
                          data.tailoring[q.key] === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Recommendation preview */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">
                Approche recommandée :{' '}
                <span className="font-bold capitalize">{APPROACHES.find((a) => a.value === recommended)?.label ?? recommended}</span>
              </p>
              <p className="text-xs text-blue-400 mt-0.5">
                {APPROACHES.find((a) => a.value === recommended)?.desc}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={prevStep}>← Retour</Button>
              <Button className="flex-1" onClick={() => { updateData({ firstProjectApproach: recommended }); nextStep() }}>
                Utiliser {APPROACHES.find((a) => a.value === recommended)?.label} →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirmation ── */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">C'est parti !</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-6">
              <Row label="Profil" value={PROFILES.find((p) => p.value === data.profileType)?.label ?? data.profileType ?? '—'} />
              {data.firstProjectName && <Row label="Projet" value={data.firstProjectName} />}
              {data.firstProjectSector && <Row label="Secteur" value={SECTORS.find((s) => s.value === data.firstProjectSector)?.label ?? data.firstProjectSector} />}
              <Row label="Approche" value={APPROACHES.find((a) => a.value === (data.firstProjectApproach ?? recommended))?.label ?? '—'} />
            </div>
            <Button className="w-full" onClick={handleFinish}>
              {data.firstProjectName.trim() ? 'Créer mon projet et commencer' : 'Accéder au dashboard'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/onboarding/page.tsx store/useOnboardingStore.ts
git commit -m "feat: onboarding wizard — 4 steps with PMBOK tailoring, light theme, recommendApproach"
```

---

## Phase 4 — Final verification

---

### Task 19: Build check and smoke test

- [ ] **Step 1: Full TypeScript + lint pass**

```bash
npx tsc --noEmit && npm run lint
```
Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: `✓ Compiled successfully` with no TypeScript errors. If you see `Type error:` in the build output, fix it before proceeding.

- [ ] **Step 3: Start dev server and smoke-test the 3 priorities**

```bash
npm run dev
```

Test P1 — Copilote:
- Open `http://localhost:3000/dashboard/copilote`
- Confirm agent sidebar visible with unlocked agents (based on org plan) and locked agents dimmed
- Send a message → confirm streaming response
- Confirm quota bar updates

Test P2 — Dashboard:
- Open `http://localhost:3000/dashboard`
- Confirm 4 KPI cards visible above project grid
- Click a project card → confirm it navigates to `/dashboard/projects/[id]`
- Confirm 5 tabs render; Dashboard tab opens by default with dark navy layout
- Click Work Packages tab → confirm existing kanban list loads

Test P3 — Onboarding:
- Open `http://localhost:3000/onboarding`
- Step through all 4 steps
- Confirm PMBOK tailoring questions on step 3 and recommendation badge updates live

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: final build verification — all 3 priorities complete"
```

---

## Self-review against spec

**Spec section coverage:**

| Spec section | Task(s) |
|---|---|
| 1.1 types/copilote.ts additions | Task 1 |
| 1.2 PLAN_LIMITS updated | Task 1 |
| 1.3 useAiAgent extended | Task 3 |
| 1.4 GET /api/user/plan | Task 2 |
| 1.5 AppSidebar — Copilote link, plan badge | Task 5 |
| 1.6 ai-agent route model + agentId | Task 4 |
| 2.1 Copilote page layout | Task 9 |
| 2.2 AgentSelector | Task 6 |
| 2.3 CopiloteIA activeAgent prop | Task 7 |
| 2.4 WorkflowTriggers plan gating | Task 8 |
| 3.1 Dashboard KPI cards | Task 11, 12 |
| 3.2 ProjectCard RAG + link | Task 12 |
| 3.3 Unified /dashboard/projects/[id] tabs | Task 13–16 |
| 3.4 KPI formulas in computeProjectMetrics | Task 10 |
| 4.1 Onboarding light theme | Task 18 |
| 4.2 4-step wizard with PMBOK tailoring | Task 17–18 |
| 4.3 Post-signup redirect | Handled by existing auth callback + onboarding_completed check in dashboard |

**All spec requirements covered.**
