'use client'

import { ListClient } from '@/app/(app)/projects/[id]/list/client'

export function WorkPackagesTab({ projectId }: { projectId: string }) {
  return <ListClient projectId={projectId} />
}
