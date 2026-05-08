'use client'

import { useAIStore } from '@/store/useAIStore'
import type { AIMessage } from '@/types/ai'

export function useAI() {
  const { addMessage, setStreaming, messages, isStreaming } = useAIStore()

  async function sendMessage(content: string, projectId?: string) {
    const userMessage: AIMessage = { role: 'user', content }
    addMessage(userMessage)
    setStreaming(true)

    const assistantMessage: AIMessage = { role: 'assistant', content: '' }
    addMessage(assistantMessage)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          projectId,
        }),
      })

      if (!response.ok) throw new Error('AI request failed')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        // Update last message with accumulated content
        useAIStore.setState((state) => {
          const msgs = [...state.messages]
          msgs[msgs.length - 1] = { role: 'assistant', content: accumulated }
          return { messages: msgs }
        })
      }
    } catch (err) {
      useAIStore.setState((state) => {
        const msgs = [...state.messages]
        msgs[msgs.length - 1] = {
          role: 'assistant',
          content: "Une erreur est survenue. Veuillez réessayer.",
        }
        return { messages: msgs }
      })
    } finally {
      setStreaming(false)
    }
  }

  return { sendMessage, isStreaming, messages }
}
