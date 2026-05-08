export type ProjectApproach = 'predictive' | 'agile' | 'hybrid'
export type ProjectSector = 'construction' | 'it_software' | 'marketing_events' | 'rd_innovation' | 'transformation' | 'product_launch' | 'regulatory_public' | 'other'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled'
export type WpStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled'
export type RagStatus = 'green' | 'amber' | 'red'
export type UserProfileType = 'artisan' | 'pm_advanced' | 'sme_manager'

export type Project = {
  id: string
  org_id: string | null
  owner_id: string
  name: string
  description: string | null
  sector: ProjectSector | null
  approach: ProjectApproach
  status: ProjectStatus
  purpose: string | null
  success_criteria: SuccessCriteria[]
  in_scope: string | null
  out_of_scope: string | null
  start_date: string | null
  target_end_date: string | null
  actual_end_date: string | null
  budget: number | null
  budget_currency: string
  tailoring_answers: Record<string, number>
  created_at: string
  updated_at: string
}

export type SuccessCriteria = {
  indicator: string
  baseline: string
  target: string
  method: string
}

export type WorkPackage = {
  id: string
  project_id: string
  parent_id: string | null
  name: string
  description: string | null
  status: WpStatus
  owner_id: string | null
  estimated_effort_hours: number | null
  actual_effort_hours: number | null
  estimated_cost: number | null
  actual_cost: number | null
  due_date: string | null
  completed_at: string | null
  tags: string[]
  position: number
  wbs_code: string | null
  created_at: string
  updated_at: string
}

export type Risk = {
  id: string
  project_id: string
  code: string | null
  title: string
  description: string | null
  category: 'technical' | 'organizational' | 'external' | 'project_management' | 'commercial'
  is_opportunity: boolean
  probability: number | null
  impact: number | null
  score: number
  strategy: string | null
  response_actions: string | null
  trigger_condition: string | null
  status: 'open' | 'mitigating' | 'closed' | 'realized'
  owner_id: string | null
  last_review_date: string | null
  created_at: string
  updated_at: string
}

export type Stakeholder = {
  id: string
  project_id: string
  name: string
  role: string | null
  organization: string | null
  email: string | null
  phone: string | null
  interest: string | null
  power: number | null
  influence: number | null
  attitude: 'champion' | 'supportive' | 'neutral' | 'resistant' | 'blocker'
  current_engagement: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
  desired_engagement: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'
  engagement_strategy: string | null
  notes: string | null
  owner_id: string | null
  last_contact_date: string | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  profile_type: UserProfileType
  org_id: string | null
  onboarding_completed: boolean
  preferred_language: string
  created_at: string
  updated_at: string
}
