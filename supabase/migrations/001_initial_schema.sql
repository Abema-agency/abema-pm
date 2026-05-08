-- Extensions
create extension if not exists "uuid-ossp";

-- =============================================================
-- ENUMS
-- =============================================================

create type project_approach as enum ('predictive', 'agile', 'hybrid');
create type project_sector as enum (
  'construction', 'it_software', 'marketing_events', 'rd_innovation',
  'transformation', 'product_launch', 'regulatory_public', 'other'
);
create type project_status as enum ('active', 'on_hold', 'completed', 'archived', 'cancelled');
create type user_profile_type as enum ('artisan', 'pm_advanced', 'sme_manager');
create type risk_strategy as enum ('avoid', 'transfer', 'mitigate', 'accept', 'escalate', 'exploit', 'share', 'enhance');
create type risk_status as enum ('open', 'mitigating', 'closed', 'realized');
create type risk_category as enum ('technical', 'organizational', 'external', 'project_management', 'commercial');
create type rag_status as enum ('green', 'amber', 'red');
create type stakeholder_attitude as enum ('champion', 'supportive', 'neutral', 'resistant', 'blocker');
create type stakeholder_engagement as enum ('unaware', 'resistant', 'neutral', 'supportive', 'leading');
create type artifact_type as enum (
  'project_charter', 'wbs', 'stakeholder_register',
  'risk_register', 'communications_plan', 'status_report',
  'change_request', 'lessons_learned'
);
create type wp_status as enum ('not_started', 'in_progress', 'blocked', 'completed', 'cancelled');

-- =============================================================
-- ORGANIZATIONS
-- =============================================================

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null default 'lite',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- PROFILES (extends Supabase auth.users)
-- =============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  profile_type user_profile_type default 'artisan',
  org_id uuid references organizations(id),
  onboarding_completed boolean default false,
  preferred_language text default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- PROJECTS
-- =============================================================

create table projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id),
  owner_id uuid not null references profiles(id),
  name text not null,
  description text,
  sector project_sector,
  approach project_approach default 'hybrid',
  status project_status default 'active',
  -- Charte
  purpose text,
  success_criteria jsonb default '[]'::jsonb,
  in_scope text,
  out_of_scope text,
  -- Contraintes
  start_date date,
  target_end_date date,
  actual_end_date date,
  budget numeric(12,2),
  budget_currency text default 'EUR',
  -- Meta
  tailoring_answers jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- PROJECT MEMBERS
-- =============================================================

create table project_members (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'contributor',
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- =============================================================
-- WORK PACKAGES
-- =============================================================

create table work_packages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  parent_id uuid references work_packages(id),
  name text not null,
  description text,
  status wp_status default 'not_started',
  owner_id uuid references profiles(id),
  estimated_effort_hours numeric(6,1),
  actual_effort_hours numeric(6,1),
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  due_date date,
  completed_at timestamptz,
  tags text[] default '{}',
  position integer default 0,
  wbs_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- STAKEHOLDERS
-- =============================================================

create table stakeholders (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  role text,
  organization text,
  email text,
  phone text,
  interest text,
  power integer check (power between 1 and 5),
  influence integer check (influence between 1 and 5),
  attitude stakeholder_attitude default 'neutral',
  current_engagement stakeholder_engagement default 'unaware',
  desired_engagement stakeholder_engagement default 'supportive',
  engagement_strategy text,
  notes text,
  owner_id uuid references profiles(id),
  last_contact_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- RISKS
-- =============================================================

create table risks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  code text,
  title text not null,
  description text,
  category risk_category default 'external',
  is_opportunity boolean default false,
  probability integer check (probability between 1 and 5),
  impact integer check (impact between 1 and 5),
  score integer generated always as (coalesce(probability, 0) * coalesce(impact, 0)) stored,
  strategy risk_strategy,
  response_actions text,
  trigger_condition text,
  status risk_status default 'open',
  owner_id uuid references profiles(id),
  last_review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- ISSUES
-- =============================================================

create table issues (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  risk_id uuid references risks(id),
  title text not null,
  description text,
  severity text default 'medium',
  status text default 'open',
  owner_id uuid references profiles(id),
  raised_date date default current_date,
  resolution text,
  target_close_date date,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- ARTIFACTS
-- =============================================================

create table artifacts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  type artifact_type not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  version integer default 1,
  status text default 'draft',
  generated_by_ai boolean default false,
  created_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- STATUS REPORTS
-- =============================================================

create table status_reports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  rag_status rag_status default 'green',
  headline text,
  schedule_variance_days integer,
  cost_variance_amount numeric(10,2),
  scope_stable boolean default true,
  achievements jsonb default '[]'::jsonb,
  next_period_plan jsonb default '[]'::jsonb,
  decisions_needed jsonb default '[]'::jsonb,
  content jsonb default '{}'::jsonb,
  generated_by_ai boolean default true,
  sent_to text[],
  sent_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- AI INTERACTIONS (log)
-- =============================================================

create table ai_interactions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id),
  user_id uuid not null references profiles(id),
  interaction_type text,
  prompt_preview text,
  tokens_used integer,
  created_at timestamptz not null default now()
);

-- =============================================================
-- INDEXES
-- =============================================================

create index idx_projects_org on projects(org_id);
create index idx_projects_owner on projects(owner_id);
create index idx_wp_project on work_packages(project_id);
create index idx_wp_status on work_packages(status);
create index idx_risks_project on risks(project_id);
create index idx_risks_status on risks(status);
create index idx_stakeholders_project on stakeholders(project_id);
create index idx_artifacts_project on artifacts(project_id);
create index idx_artifacts_type on artifacts(type);
create index idx_status_reports_project on status_reports(project_id);

-- =============================================================
-- UPDATED_AT AUTO-TRIGGER
-- =============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated before update on projects for each row execute function update_updated_at();
create trigger trg_profiles_updated before update on profiles for each row execute function update_updated_at();
create trigger trg_work_packages_updated before update on work_packages for each row execute function update_updated_at();
create trigger trg_risks_updated before update on risks for each row execute function update_updated_at();
create trigger trg_stakeholders_updated before update on stakeholders for each row execute function update_updated_at();
create trigger trg_artifacts_updated before update on artifacts for each row execute function update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table work_packages enable row level security;
alter table stakeholders enable row level security;
alter table risks enable row level security;
alter table issues enable row level security;
alter table artifacts enable row level security;
alter table status_reports enable row level security;
alter table ai_interactions enable row level security;

-- Profiles
create policy "profiles_self" on profiles for all using (id = auth.uid());

-- Projects
create policy "projects_member_access" on projects for all using (
  owner_id = auth.uid() or
  id in (select project_id from project_members where user_id = auth.uid())
);

-- project_members
create policy "project_members_access" on project_members for all using (
  user_id = auth.uid() or
  project_id in (select id from projects where owner_id = auth.uid())
);

-- Work packages
create policy "wp_project_access" on work_packages for all using (
  project_id in (
    select id from projects where owner_id = auth.uid()
    union
    select project_id from project_members where user_id = auth.uid()
  )
);

-- Risks
create policy "risks_project_access" on risks for all using (
  project_id in (
    select id from projects where owner_id = auth.uid()
    union
    select project_id from project_members where user_id = auth.uid()
  )
);

-- Stakeholders
create policy "stakeholders_project_access" on stakeholders for all using (
  project_id in (
    select id from projects where owner_id = auth.uid()
    union
    select project_id from project_members where user_id = auth.uid()
  )
);

-- Artifacts
create policy "artifacts_project_access" on artifacts for all using (
  project_id in (
    select id from projects where owner_id = auth.uid()
    union
    select project_id from project_members where user_id = auth.uid()
  )
);

-- Issues
create policy "issues_project_access" on issues for all using (
  project_id in (
    select id from projects where owner_id = auth.uid()
    union
    select project_id from project_members where user_id = auth.uid()
  )
);

-- Status reports
create policy "status_reports_project_access" on status_reports for all using (
  project_id in (
    select id from projects where owner_id = auth.uid()
    union
    select project_id from project_members where user_id = auth.uid()
  )
);

-- AI interactions
create policy "ai_interactions_own" on ai_interactions for all using (user_id = auth.uid());
