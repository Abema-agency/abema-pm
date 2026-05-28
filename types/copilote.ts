export type Plan = 'lite' | 'solo' | 'pro' | 'team'

export type PlanLimits = {
  aiMessagesPerMonth: number
  workflowTriggersPerMonth: number
  maxTokensPerRequest: number
  dailyRequests: number
  model: string
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  lite:  { aiMessagesPerMonth: 300,  workflowTriggersPerMonth: 10,  maxTokensPerRequest: 200,  dailyRequests: 10,  model: 'claude-haiku-4-5-20251001' },
  solo:  { aiMessagesPerMonth: 1500, workflowTriggersPerMonth: 50,  maxTokensPerRequest: 500,  dailyRequests: 50,  model: 'claude-sonnet-4-6' },
  pro:   { aiMessagesPerMonth: 6000, workflowTriggersPerMonth: 200, maxTokensPerRequest: 1000, dailyRequests: 200, model: 'claude-sonnet-4-6' },
  team:  { aiMessagesPerMonth: -1,   workflowTriggersPerMonth: -1,  maxTokensPerRequest: 2000, dailyRequests: -1,  model: 'claude-sonnet-4-6' },
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
