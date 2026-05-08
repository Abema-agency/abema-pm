export type AIMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AIInteractionType =
  | 'chat'
  | 'generate_artifact'
  | 'health_check'
  | 'risk_suggestion'

export type AIChatRequest = {
  messages: AIMessage[]
  projectId?: string
}

export type ArtifactGenerateRequest = {
  projectId: string
  artifactType: string
}
