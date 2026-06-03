# Abema PM — Frontend Refonte Design Spec
**Date:** 2026-06-03  
**Approach:** Gaps-first (don't rebuild what works)  
**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · shadcn/ui · Supabase

---

## Decisions Summary

| Question | Decision |
|---|---|
| Scope | Gaps-first — enhance, don't rebuild |
| Project detail routing | New unified page at `/dashboard/projects/[id]` |
| Anthropic model | Lite=Haiku, Solo=Sonnet, Pro+Team=claude-opus-4-5 |
| Agent architecture | Hybrid — same endpoint, `agentId` logged in `ai_interactions.interaction_type` |
| Implementation order | Shared layer first, then UI per priority |
| Copilote layout | Left sidebar (agents) + main chat |
| Dashboard layout | Parsons/OXAGON dense executive style |
| Project detail default tab | "Tableau de bord" (Dashboard-first) |
| Onboarding theme | Light warm (onboarding) → dark navy (app) |

---

## 1. Shared Infrastructure Layer

### 1.1 `types/copilote.ts` — additions

```typescript
export type AgentId = 'assistant' | 'artifacts' | 'risks' | 'decision' | 'coach' | 'executive'

export type AgentConfig = {
  id: AgentId
  label: string
  description: string
  systemPromptKey: string
}

export const AGENTS: AgentConfig[] = [
  { id: 'assistant',  label: 'Assistant projet',     description: 'Questions générales sur votre projet', systemPromptKey: 'assistant' },
  { id: 'artifacts',  label: 'Générateur artefacts',  description: 'Créer charte, RACI, PMP...', systemPromptKey: 'artifacts' },
  { id: 'risks',      label: 'Analyse risques',       description: 'Identifier et évaluer les risques', systemPromptKey: 'risks' },
  { id: 'decision',   label: 'Copilote décisionnel',  description: 'Arbitrer les choix complexes', systemPromptKey: 'decision' },
  { id: 'coach',      label: 'Coach PM',              description: 'Monter en compétence PMBOK 8', systemPromptKey: 'coach' },
  { id: 'executive',  label: 'Rapport exécutif',      description: 'Synthèse pour dirigeants', systemPromptKey: 'executive' },
]
```

### 1.2 `PLAN_LIMITS` — updated

```typescript
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  lite:  { agents: ['assistant'],                                              model: 'claude-haiku-4-5-20251001',  dailyRequests: 5,   aiMessagesPerMonth: 300,  workflowTriggersPerMonth: 0,   maxTokensPerRequest: 200,  webhookTriggers: false },
  solo:  { agents: ['assistant','artifacts','risks'],                          model: 'claude-sonnet-4-6',          dailyRequests: 50,  aiMessagesPerMonth: 1500, workflowTriggersPerMonth: 0,   maxTokensPerRequest: 500,  webhookTriggers: false },
  pro:   { agents: ['assistant','artifacts','risks','decision','coach'],       model: 'claude-opus-4-5',            dailyRequests: 200, aiMessagesPerMonth: 6000, workflowTriggersPerMonth: 0,   maxTokensPerRequest: 1000, webhookTriggers: false },
  team:  { agents: ['assistant','artifacts','risks','decision','coach','executive'], model: 'claude-opus-4-5',     dailyRequests: -1,  aiMessagesPerMonth: -1,   workflowTriggersPerMonth: -1,  maxTokensPerRequest: 2000, webhookTriggers: true  },
}
```

**Note:** Add `webhookTriggers: boolean` and `agents: AgentId[]` to `PlanLimits` type.

### 1.3 `hooks/useAiAgent.ts` — extended API

New exports added to the `useAiAgent` hook:

```typescript
// New return values
canUseAgent(agentId: AgentId): boolean       // checks currentPlan's agent list
getRemainingQuota(): number | null           // null = unlimited (team)
currentPlan: Plan                            // fetched client-side, cached 60s
activeAgent: AgentId                         // currently selected agent
setActiveAgent(id: AgentId): void
```

Plan is fetched from a new lightweight route `GET /api/user/plan` (reads `organizations.plan` via auth + RLS, cached 60s with `revalidate`). This avoids prop-drilling from server components into client hooks.

The `sendMessage` call is updated to pass `agentId` in the request body so the API logs it.

### 1.4 New route: `GET /api/user/plan`

```typescript
// Returns: { plan: Plan, orgId: string }
// Auth required, cached 60s
```

### 1.5 `AppSidebar.tsx` — three additions

1. **"Copilote IA" nav item** — links to `/dashboard/copilote`, icon: `Bot`
2. **"Rapports" nav item** — visible only when `plan === 'team'`, links to `/dashboard/reports`
3. **Bottom plan indicator** — above logout button:
   - If `lite` or `solo`: `Plan Solo · Passer en Pro →` (link to `/pricing`)
   - If `pro`: `Plan Pro · Passer en Team →`
   - If `team`: `Plan Team ✓` (no CTA)
   - Plan data fetched server-side and passed as prop to sidebar

### 1.6 `app/api/ai-agent/route.ts` — model update

Change `PLAN_LIMITS` lookup: `pro` and `team` now use `claude-opus-4-5` (was `claude-sonnet-4-6`).  
Pass `agentId` from request body through to `ai_interactions.interaction_type` log.

---

## 2. Priority 1 — Copilote IA gaps

### 2.1 Page layout: `/dashboard/copilote/page.tsx`

Server component. Fetches: user, plan, org, daily usage count. Passes to `<CopilotePageClient>`.

Layout:
```
┌─────────────────────────────────────────────────────┐
│ AppHeader "Copilote IA" + plan badge + quota counter │
├──────────────────┬──────────────────────────────────┤
│  Agent sidebar   │  CopiloteIA chat (flex-1)        │
│  (240px fixed)   │                                  │
│                  │  streaming messages               │
│  [agent cards]   │                                  │
│                  │  [input bar]                     │
│  [quota bar]     │                                  │
│  [WF triggers]   │                                  │
│  (team only)     │                                  │
└──────────────────┴──────────────────────────────────┘
```

### 2.2 Agent sidebar component: `components/copilote/AgentSelector.tsx`

- Renders `AGENTS` list filtered to show all 6 (unlocked and locked)
- Unlocked agents (in `PLAN_LIMITS[plan].agents`): active border on selection
- Locked agents: dimmed (opacity-50), plan badge (e.g., `Pro` / `Team`), cursor-not-allowed, tooltip "Disponible en plan Pro"
- Clicking a locked agent shows an inline upgrade nudge, does NOT open chat
- `activeAgent` highlighted with blue border + left accent
- Quota bar at bottom: `X / Y req ce mois` with color-coded fill (green→amber→red)
- WorkflowTriggers section below quota, visible only if `plan === 'team'`

### 2.3 `CopiloteIA.tsx` — prop additions

```typescript
interface CopiloteIAProps {
  projectId?: string
  activeAgent: AgentId      // NEW — injected from sidebar
}
```

Chat header shows active agent name + model name (small, muted).

### 2.4 `WorkflowTriggers.tsx` — plan gating

Currently shown to all plans. Change: render `null` if `plan !== 'team'`.  
When rendered, keep existing functionality (status_report + risk_alert buttons).

---

## 3. Priority 2 — Dashboard gaps

### 3.1 `app/(app)/dashboard/page.tsx` — KPI cards

Add 4 KPI cards above the project grid:

| Card | Data source | Red condition |
|---|---|---|
| Projets actifs | `COUNT(projects WHERE status='active')` | — |
| Tâches en retard | `COUNT(work_packages WHERE due_date < now AND status != 'done')` | > 0 |
| Risques critiques | `COUNT(risks WHERE probability * impact >= 15 AND status != 'closed')` | > 0 |
| Score RAG global | Computed from SPI + overdue tasks + critical risks | RED or AMBER |

RAG global formula:
- `red` if SPI < 0.9 OR overdue_tasks > 20% total OR critical_risks > 0  
- `amber` if SPI 0.9–0.95 OR overdue_tasks 10–20% OR overdue_risk_reviews > 0  
- `green` otherwise

**Important:** SPI requires `planned_progress` data. If unavailable, show KPI cards without SPI row (graceful degradation — don't show 0 or error, just omit the SPI metric).

Visual style: dark navy cards (`bg-[#1E293B]`), colored border on alert state, large mono numbers, small uppercase labels.

### 3.2 `components/project/ProjectCard.tsx` — RAG display

Add to existing card:
- RAG dot (8px circle, red/amber/green) next to project name
- SPI value if available (small, muted, `font-mono`)
- Progression bar (already exists — keep)
- Next milestone date + variance in days (colored)

### 3.3 New page: `app/(app)/dashboard/projects/[id]/page.tsx`

Unified project detail with 5 tabs. Route: `/dashboard/projects/[id]`.

**Default tab:** Tableau de bord (Dashboard-first).

Tab structure:
```
[Tableau de bord] [Work Packages] [Risques] [Parties prenantes] [Copilote]
```

**Tab: Tableau de bord**  
The full Parsons/OXAGON executive dashboard (see design mockup). 5 sections:
1. Header bar — project name, budget, start/finish dates, forecast, variance days
2. Avancement block — 4 metrics (planifié %, réel %, variance %, progrès hebdo) + 6-week sparkline (outlined bars=planned, filled blue=actual) + SPI gauge with target marker at 1.0
3. Jalons & Calendrier — duration table (total/elapsed/remaining) + milestone list with RAG dots and variance days
4. Qualité & Risques — 4 KPI boxes + risk matrix with P×I scores + non-conformités
5. Valeur acquise (EVM) — BAC/PV/EV/SV badges + period table + SPI/EAC/jalons facturés row. EAC box uses red background (`rgba(239,68,68,.12)` border `#EF4444`) when EAC > BAC.
6. Rapport narratif — 5-column table: En cours | Réalisations | Points d'attention | Look-ahead | Mitigation

All data fetched server-side. Graceful degradation: EVM section hidden if no budget set. Narrative table hidden if no status_reports entries.

**Tab: Work Packages**  
Extract list view from `app/(app)/projects/[id]/list/client.tsx` into `components/project/WorkPackagesTab.tsx`. Add filter bar (statut, phase). Show overdue count in tab badge (red).

**Tab: Risques**  
Extract from `app/(app)/projects/[id]/risks/client.tsx` into `components/project/RisksTab.tsx`. Renders P×I matrix SVG + risk table. The original route page (`/projects/[id]/risks`) imports this component too — no logic duplication.

**Tab: Parties prenantes**  
Extract from `app/(app)/projects/[id]/stakeholders/client.tsx` into `components/project/StakeholdersTab.tsx`. Same pattern.

**Tab: Copilote**  
`<CopiloteIA projectId={id} activeAgent="assistant" />` — injects project context. No agent sidebar (inline, single-agent view in project context).

### 3.4 KPI formulas (all computed server-side)

```
Elapsed Duration     = dataDate - project.start_date (days)
Remaining Duration   = project.forecast_finish - dataDate (days)
Variance (days)      = project.forecast_finish - project.planned_finish (days)
Cum Actual %         = completed_wp / total_wp
Cum Planned %        = wp_due_by_today / total_wp
Weekly Progress %    = cum_actual_current - cum_actual_last_week
Sparkline (6 weeks)  = GROUP BY week_number: COUNT(work_packages WHERE completed_at >= week_start AND completed_at < week_end) / total_wp. Query: SELECT date_trunc('week', updated_at), COUNT(*) FROM work_packages WHERE project_id=X AND status='done' GROUP BY 1 ORDER BY 1 DESC LIMIT 6. Planned series uses created_at + estimated_duration if available, else omit planned bars.
SPI                  = cum_actual / cum_planned  (guard: if cum_planned = 0, show N/A)
BAC                  = organizations.budget (if set)
PV                   = BAC × cum_planned %
EV                   = BAC × cum_actual %
EAC                  = BAC / SPI  (if SPI > 0 and BAC available)
Schedule Variance    = EV - PV
```

---

## 4. Priority 3 — Onboarding polish

### 4.1 Theme

Light warm (`bg-gray-50`, white cards, `#374151` text) for the onboarding flow.  
Transitions to dark navy on first dashboard load — no special animation needed, just the natural Next.js route transition.

### 4.2 Wizard steps (4 steps, updated from current 5)

**Step 1 — Profil** (existing, keep)  
Options: Artisan/TPE | Chef de projet | Dirigeant PME

**Step 2 — Premier projet** (enhanced from current step 4)  
Fields: nom (required), secteur (dropdown: BTP, IT, Conseil, Industrie, Autre), type (prédictif / agile / hybride)  
Remove: description (optional, adds friction — can be added later in project settings)

**Step 3 — Tailoring PMBOK 8** (NEW)  
5 quick binary/3-option questions → outputs recommended approach:

| # | Question | Options |
|---|---|---|
| 1 | Taille de votre équipe projet ? | 1-3 · 4-10 · 10+ |
| 2 | Le périmètre est-il bien défini au départ ? | Oui, figé · Partiellement · Non, évolutif |
| 3 | Votre client demande-t-il des livrables formels ? | Oui · Non |
| 4 | Avez-vous une contrainte de budget fixe ? | Oui · Non |
| 5 | À quelle fréquence livrez-vous ? | Par jalons · En continu · Les deux |

Recommendation logic:
- Mostly fixed/formal → `prédictif`  
- Mostly evolving/continuous → `agile`  
- Mixed → `hybride` (default, already set)

Auto-sets `projects.approach` for the first project created in step 2.

**Step 4 — C'est parti!** (existing step 5, restyled)  
Summary card (profil, projet, approche recommandée) + single CTA.  
On confirm: insert profile, insert project, redirect to `/dashboard`.

### 4.3 Post-signup redirect

`app/(auth)/signup/page.tsx` or auth callback: check `profiles.onboarding_completed`. If false → redirect to `/onboarding`. If true → redirect to `/dashboard`.

---

## 5. Technical constraints (from AGENTS.md + existing code)

- Auth: `@supabase/ssr` (`createServerClient` / `createBrowserClient`) — no changes
- Post-login redirect: `window.location.href` (not `router.push`) — for auth pages only
- Table names: `work_packages` (not tasks), `risks.last_review_date` (not last_reviewed_at)
- RAG enum: lowercase `red` / `amber` / `green`
- RLS: always filter by `org_id`, never unscoped queries
- Never use `claude-sonnet-4-5-20251001`
- All Supabase env vars: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 6. Files to create / modify

### New files
- `app/api/user/plan/route.ts` — lightweight plan endpoint
- `app/(app)/dashboard/projects/[id]/page.tsx` — unified project detail
- `components/copilote/AgentSelector.tsx` — agent sidebar with plan gating
- `components/dashboard/KpiCards.tsx` — 4 KPI cards for dashboard
- `components/dashboard/ProjectDashboard.tsx` — Parsons-style executive view
- `components/dashboard/Sparkline.tsx` — 6-week trend bars
- `components/dashboard/NarrativeTable.tsx` — 5-column narrative
- `components/dashboard/EvmSection.tsx` — earned value block
- `docs/superpowers/specs/2026-06-03-frontend-refonte-design.md` (this file)

### Modified files
- `types/copilote.ts` — add AgentId, AgentConfig, AGENTS, update PLAN_LIMITS
- `hooks/useAiAgent.ts` — add canUseAgent, getRemainingQuota, currentPlan, activeAgent
- `app/api/ai-agent/route.ts` — update model for pro/team, log agentId
- `app/(app)/dashboard/page.tsx` — add KPI cards
- `app/(app)/dashboard/copilote/page.tsx` — add AgentSelector sidebar layout
- `components/copilote/CopiloteIA.tsx` — add activeAgent prop
- `components/copilote/WorkflowTriggers.tsx` — add plan gating (team only)
- `components/layout/AppSidebar.tsx` — add Copilote IA link, Rapports (team), plan badge
- `app/(app)/onboarding/page.tsx` — 4 steps, light theme, PMBOK tailoring step
- `components/project/ProjectCard.tsx` — add RAG dot, next milestone

### Unchanged (do not touch)
- All existing `/projects/[id]/kanban`, `/list`, `/risks`, `/stakeholders`, `/artifacts`, `/reports` pages
- `hooks/useWorkPackages.ts`, `hooks/useRisks.ts`, `hooks/useStakeholders.ts`
- All marketing pages, auth pages (except signup redirect)
- N8N webhook routes

---

## 7. Anti-patterns to avoid (from design brief)

- No `border-left` color accent > 1px on cards
- No glassmorphism
- Not every button primary — use ghost/secondary/text hierarchy
- No modals for simple actions
- No generic Heroicons above every section title
- No "No data found" — always an educational empty state
- No Inter/Roboto — use system-ui for labels, Geist Mono for numbers
