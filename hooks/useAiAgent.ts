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
