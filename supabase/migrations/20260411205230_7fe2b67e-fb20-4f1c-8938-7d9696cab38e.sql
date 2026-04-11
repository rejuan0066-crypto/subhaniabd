
-- Create class_routines table
CREATE TABLE public.class_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_session_id UUID REFERENCES public.academic_sessions(id) ON DELETE SET NULL,
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create routine_periods table
CREATE TABLE public.routine_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES public.class_routines(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period_number INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_name TEXT,
  teacher_name_bn TEXT,
  room TEXT,
  is_break BOOLEAN DEFAULT false,
  break_label TEXT,
  break_label_bn TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_periods ENABLE ROW LEVEL SECURITY;

-- Policies for class_routines
CREATE POLICY "Anyone can view active routines"
  ON public.class_routines FOR SELECT USING (true);

CREATE POLICY "Admins can insert routines"
  ON public.class_routines FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update routines"
  ON public.class_routines FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete routines"
  ON public.class_routines FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies for routine_periods
CREATE POLICY "Anyone can view routine periods"
  ON public.routine_periods FOR SELECT USING (true);

CREATE POLICY "Admins can insert routine periods"
  ON public.routine_periods FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update routine periods"
  ON public.routine_periods FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete routine periods"
  ON public.routine_periods FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_routine_periods_routine_id ON public.routine_periods(routine_id);
CREATE INDEX idx_class_routines_class_id ON public.class_routines(class_id);
