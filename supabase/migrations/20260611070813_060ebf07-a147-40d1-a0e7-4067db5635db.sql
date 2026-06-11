ALTER TABLE public.ic_plan_versions
  ADD COLUMN IF NOT EXISTS quarter text,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by text;