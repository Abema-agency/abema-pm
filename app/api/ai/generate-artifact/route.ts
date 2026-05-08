import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, AI_MODEL } from '@/lib/ai/client'
import { buildArtifactPrompt, type ArtifactType } from '@/lib/ai/prompts/artifact-generator'
import type { ArtifactGenerateRequest } from '@/types/ai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: ArtifactGenerateRequest = await request.json()
  const { projectId, artifactType } = body

  if (!projectId || !artifactType) {
    return NextResponse.json({ error: 'Missing projectId or artifactType' }, { status: 400 })
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const prompt = buildArtifactPrompt(artifactType as ArtifactType, project)

  const anthropic = getAnthropicClient()
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
  }

  let parsedContent: Record<string, unknown>
  try {
    parsedContent = JSON.parse(content.text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: content.text }, { status: 500 })
  }

  // Save artifact to database
  const { data: artifact, error: insertError } = await supabase
    .from('artifacts')
    .insert({
      project_id: projectId,
      type: artifactType as ArtifactType,
      title: (parsedContent.title as string) ?? artifactType,
      content: parsedContent as import('@/types/supabase').Json,
      generated_by_ai: true,
      created_by: user.id,
      version: 1,
      status: 'draft',
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to save artifact' }, { status: 500 })
  }

  // Log interaction
  await supabase.from('ai_interactions').insert({
    project_id: projectId,
    user_id: user.id,
    interaction_type: 'generate_artifact',
    prompt_preview: artifactType,
    tokens_used: message.usage.output_tokens,
  })

  return NextResponse.json({ artifact })
}
