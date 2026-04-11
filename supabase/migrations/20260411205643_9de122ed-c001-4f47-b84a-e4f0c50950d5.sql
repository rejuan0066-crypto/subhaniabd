
-- Create exam_routines table
CREATE TABLE public.exam_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  exam_session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create exam_routine_entries table
CREATE TABLE public.exam_routine_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES public.exam_routines(id) ON DELETE CASCADE NOT NULL,
  exam_date DATE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  notes TEXT,
  notes_bn TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_routine_entries ENABLE ROW LEVEL SECURITY;

-- Policies for exam_routines
CREATE POLICY "Anyone can view exam routines"
  ON public.exam_routines FOR SELECT USING (true);

CREATE POLICY "Admins can insert exam routines"
  ON public.exam_routines FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update exam routines"
  ON public.exam_routines FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete exam routines"
  ON public.exam_routines FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies for exam_routine_entries
CREATE POLICY "Anyone can view exam routine entries"
  ON public.exam_routine_entries FOR SELECT USING (true);

CREATE POLICY "Admins can insert exam routine entries"
  ON public.exam_routine_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update exam routine entries"
  ON public.exam_routine_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete exam routine entries"
  ON public.exam_routine_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_exam_routine_entries_routine_id ON public.exam_routine_entries(routine_id);
CREATE INDEX idx_exam_routines_session_id ON public.exam_routines(exam_session_id);
