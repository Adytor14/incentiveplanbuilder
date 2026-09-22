ALTER TABLE public.ic_plan_versions
  ADD COLUMN IF NOT EXISTS plan_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS ic_plan_versions_is_active_idx ON public.ic_plan_versions (is_active);