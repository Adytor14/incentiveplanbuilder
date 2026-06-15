
DROP POLICY IF EXISTS "Public can insert versions" ON public.ic_plan_versions;
DROP POLICY IF EXISTS "Public can update versions" ON public.ic_plan_versions;
DROP POLICY IF EXISTS "Public can delete versions" ON public.ic_plan_versions;

CREATE POLICY "Authenticated can insert versions"
  ON public.ic_plan_versions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update versions"
  ON public.ic_plan_versions FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete versions"
  ON public.ic_plan_versions FOR DELETE TO authenticated
  USING (true);
