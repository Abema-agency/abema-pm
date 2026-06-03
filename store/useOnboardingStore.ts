// store/useOnboardingStore.ts
'use client'

import { create } from 'zustand'
import type { UserProfileType, ProjectApproach, ProjectSector } from '@/types/project'

export type TailoringAnswers = {
  teamSize: '1-3' | '4-10' | '10+' | null
  scopeDefined: 'fixed' | 'partial' | 'evolving' | null
  formalDeliverables: 'yes' | 'no' | null
  fixedBudget: 'yes' | 'no' | null
  deliveryFrequency: 'milestones' | 'continuous' | 'both' | null
}

type OnboardingData = {
  profileType: UserProfileType | null
  firstProjectName: string
  firstProjectSector: ProjectSector | null
  firstProjectApproach: ProjectApproach | null
  tailoring: TailoringAnswers
}

type OnboardingStore = {
  step: number
  data: OnboardingData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (data: Partial<OnboardingData>) => void
  updateTailoring: (t: Partial<TailoringAnswers>) => void
  reset: () => void
}

const INITIAL_TAILORING: TailoringAnswers = {
  teamSize: null,
  scopeDefined: null,
  formalDeliverables: null,
  fixedBudget: null,
  deliveryFrequency: null,
}

const INITIAL_DATA: OnboardingData = {
  profileType: null,
  firstProjectName: '',
  firstProjectSector: null,
  firstProjectApproach: null,
  tailoring: INITIAL_TAILORING,
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  data: INITIAL_DATA,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
  updateTailoring: (t) => set((state) => ({
    data: { ...state.data, tailoring: { ...state.data.tailoring, ...t } }
  })),
  reset: () => set({ step: 1, data: INITIAL_DATA }),
}))

export function recommendApproach(t: TailoringAnswers): ProjectApproach {
  let predictiveScore = 0
  let agileScore = 0

  if (t.scopeDefined === 'fixed') predictiveScore += 2
  if (t.scopeDefined === 'evolving') agileScore += 2
  if (t.formalDeliverables === 'yes') predictiveScore += 1
  if (t.fixedBudget === 'yes') predictiveScore += 1
  if (t.deliveryFrequency === 'milestones') predictiveScore += 1
  if (t.deliveryFrequency === 'continuous') agileScore += 2
  if (t.teamSize === '10+') agileScore += 1

  if (predictiveScore > agileScore + 1) return 'predictive'
  if (agileScore > predictiveScore + 1) return 'agile'
  return 'hybrid'
}
