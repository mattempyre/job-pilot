-- Allow profile remote preferences to store multiple selected values in one text column.

alter table public.profiles
  drop constraint if exists profiles_remote_preference_check;

alter table public.profiles
  drop constraint if exists profiles_remote_preference_valid;

alter table public.profiles
  add constraint profiles_remote_preference_valid check (
    remote_preference is null
    or remote_preference = 'any'
    or remote_preference ~ '^(remote|onsite|hybrid)(,(remote|onsite|hybrid))*$'
  );
