
CREATE TABLE public.joining_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL DEFAULT '',
  staff_name_bn TEXT NOT NULL DEFAULT '',
  designation TEXT DEFAULT '',
  joining_date DATE DEFAULT CURRENT_DATE,
  letter_number TEXT DEFAULT '',
  letter_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  letter_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.joining_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage joining_letters"
  ON public.joining_letters FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can manage joining_letters"
  ON public.joining_letters FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Anyone can view joining_letters"
  ON public.joining_letters FOR SELECT TO public
  USING (true);
