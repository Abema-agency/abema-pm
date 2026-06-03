'use client'

import { StakeholdersClient } from '@/app/(app)/projects/[id]/stakeholders/client'

export function StakeholdersTab({ projectId }: { projectId: string }) {
  return <StakeholdersClient projectId={projectId} />
}
