
CREATE TABLE public.address_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  label_bn text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  parent_level_key text REFERENCES public.address_levels(key),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.address_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage address_levels" ON public.address_levels FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view address_levels" ON public.address_levels FOR SELECT TO public USING (is_active = true);

INSERT INTO public.address_levels (key, label, label_bn, sort_order, parent_level_key) VALUES
  ('division', 'Division', 'বিভাগ', 1, null),
  ('district', 'District', 'জেলা', 2, 'division'),
  ('upazila', 'Upazila', 'উপজেলা', 3, 'district'),
  ('union', 'Union', 'ইউনিয়ন', 4, 'upazila'),
  ('post_office', 'Post Office', 'পোস্ট অফিস', 5, 'upazila');
