create table if not exists public.projects (
  id text primary key,
  name text not null check (length(trim(name)) > 0),
  status text not null check (status in ('active', 'paused', 'completed', 'archived')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  title text not null check (length(trim(title)) > 0),
  done boolean not null default false,
  due_date date,
  project_id text references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id text primary key,
  name text not null check (length(trim(name)) > 0),
  frequency text not null check (length(trim(frequency)) > 0),
  created_at timestamptz not null
);

create table if not exists public.finance_entries (
  id text primary key,
  description text not null check (length(trim(description)) > 0),
  amount numeric not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  date date not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists habits_created_at_idx on public.habits(created_at);
create index if not exists finance_entries_date_idx on public.finance_entries(date);
create index if not exists finance_entries_type_idx on public.finance_entries(type);
