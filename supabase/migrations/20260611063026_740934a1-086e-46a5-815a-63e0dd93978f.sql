CREATE TABLE public.ic_plan_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ic_plan_versions TO anon, authenticated;
GRANT ALL ON public.ic_plan_versions TO service_role;
ALTER TABLE public.ic_plan_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view versions" ON public.ic_plan_versions FOR SELECT USING (true);
CREATE POLICY "Public can insert versions" ON public.ic_plan_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update versions" ON public.ic_plan_versions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete versions" ON public.ic_plan_versions FOR DELETE USING (true);
INSERT INTO public.ic_plan_versions (name) VALUES ('Version 1');