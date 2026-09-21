ALTER TABLE public.ic_plan_versions
  ADD COLUMN IF NOT EXISTS request_status text NOT NULL DEFAULT 'Not Requested',
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS comments text;