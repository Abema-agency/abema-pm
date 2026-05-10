export type Plan = 'starter' | 'pro' | 'enterprise'

export type PlanLimits = {
  aiMessagesPerMonth: number
  workflowTriggersPerMonth: number
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  starter: { aiMessagesPerMonth: 50, workflowTriggersPerMonth: 10 },
  pro: { aiMessagesPerMonth: 500, workflowTriggersPerMonth: 100 },
  enterprise: { aiMessagesPerMonth: -1, workflowTriggersPerMonth: -1 },
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
  feature: Feature
}

export type CopiloteMetrics = {
  aiMessagesUsed: number
  workflowsTriggered: number
  plan: Plan
}
