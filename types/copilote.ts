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
