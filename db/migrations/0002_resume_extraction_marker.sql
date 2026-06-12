-- Track which active resume PDF has already been used for profile extraction.

alter table public.profiles
  add column if not exists resume_extracted_pdf_key text,
  add column if not exists resume_extracted_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_extracted_resume_key_matches_user;

alter table public.profiles
  add constraint profiles_extracted_resume_key_matches_user check (
    resume_extracted_pdf_key is null
    or resume_extracted_pdf_key like ('resumes/' || id::text || '/%')
  );
