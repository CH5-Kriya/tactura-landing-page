begin;

create table public.exhibition_feedback (
  id uuid primary key,
  message text not null check (
    char_length(btrim(message, E' \t\n\r')) between 1 and 1000
  ),
  created_at timestamptz not null default now(),
  is_visible boolean not null default true
);

create index exhibition_feedback_visible_recent
  on public.exhibition_feedback (created_at desc, id desc) where is_visible = true;

alter table public.exhibition_feedback enable row level security;
revoke all on public.exhibition_feedback from anon, authenticated;
grant select (id, message, created_at, is_visible) on public.exhibition_feedback to anon;
grant insert (id, message) on public.exhibition_feedback to anon;

create policy "Visitors can read visible feedback"
  on public.exhibition_feedback for select to anon using (is_visible = true);
create policy "Visitors can submit feedback"
  on public.exhibition_feedback for insert to anon with check (is_visible = true);

commit;
