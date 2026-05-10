'use client'

import { useRef, useEffect, useState } from 'react'
import { useAiAgent } from '@/hooks/useAiAgent'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, RotateCcw, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopiloteIAProps {
  projectId?: string
}

export function CopiloteIA({ projectId }: CopiloteIAProps) {
  const { messages, sendMessage, isStreaming, error, clearMessages } = useAiAgent(projectId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    void sendMessage(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
            <Bot className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Copilote IA</p>
            <p className="text-xs mt-1">Posez une question sur votre projet</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
              msg.role === 'user' ? 'bg-slate-800' : 'bg-indigo-600',
            )}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-white" />
                : <Bot className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
              msg.role === 'user'
                ? 'bg-slate-800 text-white rounded-tr-sm'
                : 'bg-slate-100 text-slate-800 rounded-tl-sm',
            )}>
              {msg.content || (isStreaming && msg.role === 'assistant' ? (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </span>
              ) : '')}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre question… (Entrée pour envoyer)"
            className="resize-none text-sm min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-1">
            <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
            {messages.length > 0 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={clearMessages}
                className="text-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
