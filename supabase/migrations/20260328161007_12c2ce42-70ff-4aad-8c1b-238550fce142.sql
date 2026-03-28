
ALTER TABLE public.students 
  ADD COLUMN IF NOT EXISTS student_category text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS residence_type text DEFAULT 'non-resident';
