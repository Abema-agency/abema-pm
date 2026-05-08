'use client'

import { create } from 'zustand'
import type { AIMessage } from '@/types/ai'

type AIStore = {
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  messages: AIMessage[]
  addMessage: (message: AIMessage) => void
  clearMessages: () => void
  isStreaming: boolean
  setStreaming: (streaming: boolean) => void
}

export const useAIStore = create<AIStore>((set) => ({
  isPanelOpen: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  isStreaming: false,
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}))
