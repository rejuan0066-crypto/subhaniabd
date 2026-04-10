
CREATE TABLE public.resign_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  letter_number TEXT,
  staff_name TEXT NOT NULL DEFAULT '',
  staff_name_bn TEXT NOT NULL DEFAULT '',
  designation TEXT,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  letter_date DATE,
  resign_date DATE,
  reason TEXT,
  letter_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resign_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view resign letters"
  ON public.resign_letters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert resign letters"
  ON public.resign_letters FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update resign letters"
  ON public.resign_letters FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete resign letters"
  ON public.resign_letters FOR DELETE TO authenticated USING (true);
