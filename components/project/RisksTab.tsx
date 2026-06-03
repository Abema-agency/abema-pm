'use client'

import { RisksClient } from '@/app/(app)/projects/[id]/risks/client'

export function RisksTab({ projectId }: { projectId: string }) {
  return <RisksClient projectId={projectId} />
}
