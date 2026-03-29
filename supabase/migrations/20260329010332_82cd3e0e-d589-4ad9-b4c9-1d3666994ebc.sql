
-- Custom form submissions table
CREATE TABLE public.custom_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.custom_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom_form_submissions" ON public.custom_form_submissions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert submissions" ON public.custom_form_submissions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view own submissions" ON public.custom_form_submissions
  FOR SELECT TO authenticated USING (submitted_by = auth.uid());
