-- JobPilot initial application schema.
-- Source of truth for InsForge public tables and row-level access policies.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  location text,
  current_title text,
  experience_level text check (
    experience_level is null
    or experience_level in ('junior', 'mid', 'senior', 'lead')
  ),
  years_experience integer check (
    years_experience is null
    or years_experience >= 0
  ),
  skills text[] not null default '{}',
  industries text[] not null default '{}',
  work_experience jsonb not null default '[]'::jsonb check (
    jsonb_typeof(work_experience) = 'array'
  ),
  education jsonb not null default '{}'::jsonb check (
    jsonb_typeof(education) = 'object'
  ),
  job_titles_seeking text[] not null default '{}',
  remote_preference text,
  preferred_locations text[] not null default '{}',
  salary_expectation text,
  cover_letter_tone text check (
    cover_letter_tone is null
    or cover_letter_tone in ('formal', 'casual', 'enthusiastic')
  ),
  linkedin_url text,
  portfolio_url text,
  work_authorization text check (
    work_authorization is null
    or work_authorization in ('citizen', 'permanent_resident', 'visa_required')
  ),
  resume_pdf_url text,
  resume_pdf_key text,
  resume_extracted_pdf_key text,
  resume_extracted_at timestamptz,
  constraint profiles_remote_preference_valid check (
    remote_preference is null
    or remote_preference = 'any'
    or remote_preference ~ '^(remote|onsite|hybrid)(,(remote|onsite|hybrid))*$'
  ),
  constraint profiles_resume_key_matches_user check (
    resume_pdf_key is null
    or resume_pdf_key like ('resumes/' || id::text || '/%')
  ),
  constraint profiles_extracted_resume_key_matches_user check (
    resume_extracted_pdf_key is null
    or resume_extracted_pdf_key like ('resumes/' || id::text || '/%')
  ),
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'running' check (
    status in ('running', 'completed', 'failed')
  ),
  job_title_searched text not null,
  location_searched text not null default '',
  jobs_found integer not null default 0 check (jobs_found >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz check (
    completed_at is null
    or completed_at >= started_at
  )
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('search', 'url')),
  source_url text,
  external_apply_url text,
  title text not null,
  company text not null,
  location text,
  salary text,
  job_type text check (
    job_type is null
    or job_type in ('fulltime', 'parttime', 'contract')
  ),
  about_role text,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  benefits text[] not null default '{}',
  about_company text,
  match_score integer check (
    match_score is null
    or match_score between 0 and 100
  ),
  match_reason text,
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  company_research jsonb check (
    company_research is null
    or jsonb_typeof(company_research) = 'object'
  ),
  found_at timestamptz not null default now(),
  constraint jobs_search_run_required check (
    source <> 'search'
    or run_id is not null
  )
);

alter table public.jobs
  drop constraint if exists jobs_run_id_fkey;

alter table public.jobs
  add constraint jobs_run_id_fkey
  foreign key (run_id)
  references public.agent_runs(id)
  on delete cascade;

create table if not exists public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  level text not null default 'info' check (
    level in ('info', 'success', 'warning', 'error')
  ),
  job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'profiles_set_updated_at'
  ) then
    create trigger profiles_set_updated_at
      before update on public.profiles
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

create index if not exists agent_runs_user_started_at_idx
  on public.agent_runs (user_id, started_at desc);

create index if not exists agent_runs_user_status_idx
  on public.agent_runs (user_id, status);

create index if not exists jobs_user_found_at_idx
  on public.jobs (user_id, found_at desc);

create index if not exists jobs_user_match_score_idx
  on public.jobs (user_id, match_score desc);

create index if not exists jobs_run_id_idx
  on public.jobs (run_id);

create index if not exists jobs_user_company_research_idx
  on public.jobs (user_id)
  where company_research is not null;

create index if not exists agent_logs_user_created_at_idx
  on public.agent_logs (user_id, created_at desc);

create index if not exists agent_logs_run_id_idx
  on public.agent_logs (run_id);

create index if not exists agent_logs_job_id_idx
  on public.agent_logs (job_id);

alter table public.profiles enable row level security;
alter table public.agent_runs enable row level security;
alter table public.jobs enable row level security;
alter table public.agent_logs enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.agent_runs to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.agent_logs to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (id = auth.uid());

drop policy if exists agent_runs_select_own on public.agent_runs;
create policy agent_runs_select_own
  on public.agent_runs
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists agent_runs_insert_own on public.agent_runs;
create policy agent_runs_insert_own
  on public.agent_runs
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists agent_runs_update_own on public.agent_runs;
create policy agent_runs_update_own
  on public.agent_runs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists agent_runs_delete_own on public.agent_runs;
create policy agent_runs_delete_own
  on public.agent_runs
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists jobs_select_own on public.jobs;
create policy jobs_select_own
  on public.jobs
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists jobs_insert_own on public.jobs;
create policy jobs_insert_own
  on public.jobs
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      run_id is null
      or exists (
        select 1
        from public.agent_runs
        where agent_runs.id = jobs.run_id
          and agent_runs.user_id = auth.uid()
      )
    )
  );

drop policy if exists jobs_update_own on public.jobs;
create policy jobs_update_own
  on public.jobs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      run_id is null
      or exists (
        select 1
        from public.agent_runs
        where agent_runs.id = jobs.run_id
          and agent_runs.user_id = auth.uid()
      )
    )
  );

drop policy if exists jobs_delete_own on public.jobs;
create policy jobs_delete_own
  on public.jobs
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists agent_logs_select_own on public.agent_logs;
create policy agent_logs_select_own
  on public.agent_logs
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists agent_logs_insert_own on public.agent_logs;
create policy agent_logs_insert_own
  on public.agent_logs
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      run_id is null
      or exists (
        select 1
        from public.agent_runs
        where agent_runs.id = agent_logs.run_id
          and agent_runs.user_id = auth.uid()
      )
    )
    and (
      job_id is null
      or exists (
        select 1
        from public.jobs
        where jobs.id = agent_logs.job_id
          and jobs.user_id = auth.uid()
      )
    )
  );

drop policy if exists agent_logs_update_own on public.agent_logs;
create policy agent_logs_update_own
  on public.agent_logs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      run_id is null
      or exists (
        select 1
        from public.agent_runs
        where agent_runs.id = agent_logs.run_id
          and agent_runs.user_id = auth.uid()
      )
    )
    and (
      job_id is null
      or exists (
        select 1
        from public.jobs
        where jobs.id = agent_logs.job_id
          and jobs.user_id = auth.uid()
      )
    )
  );

drop policy if exists agent_logs_delete_own on public.agent_logs;
create policy agent_logs_delete_own
  on public.agent_logs
  for delete
  to authenticated
  using (user_id = auth.uid());
