
CREATE TABLE public.exam_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_bn text NOT NULL,
  key text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage exam_types" ON public.exam_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view exam_types" ON public.exam_types FOR SELECT TO public USING (true);
CREATE POLICY "Staff can manage exam_types" ON public.exam_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)) WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

INSERT INTO public.exam_types (name, name_bn, key, sort_order) VALUES
  ('Annual', 'বার্ষিক', 'annual', 1),
  ('Half Yearly', 'অর্ধবার্ষিক', 'half_yearly', 2),
  ('Pre-Test', 'প্রাক-নির্বাচনী', 'pre_test', 3);
