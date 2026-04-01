
CREATE TABLE public.form_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name text UNIQUE,
  is_visible boolean DEFAULT true,
  footer_text text,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage form_settings" ON public.form_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view form_settings" ON public.form_settings
  FOR SELECT TO public
  USING (true);
