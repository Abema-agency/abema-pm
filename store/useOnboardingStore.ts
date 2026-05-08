'use client'

import { create } from 'zustand'
import type { UserProfileType } from '@/types/project'

type OnboardingData = {
  profileType: UserProfileType | null
  sector: string | null
  projectCount: number | null
  mainBlocker: string | null
  firstProjectName: string
  firstProjectDescription: string
}

type OnboardingStore = {
  step: number
  data: OnboardingData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (data: Partial<OnboardingData>) => void
  reset: () => void
}

const INITIAL_DATA: OnboardingData = {
  profileType: null,
  sector: null,
  projectCount: null,
  mainBlocker: null,
  firstProjectName: '',
  firstProjectDescription: '',
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  data: INITIAL_DATA,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
  reset: () => set({ step: 1, data: INITIAL_DATA }),
}))
