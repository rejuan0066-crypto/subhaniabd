
CREATE TABLE public.promotion_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_session_id UUID REFERENCES public.academic_sessions(id),
  to_session_id UUID REFERENCES public.academic_sessions(id),
  from_class_id UUID REFERENCES public.classes(id),
  to_class_id UUID REFERENCES public.classes(id),
  from_division_id UUID REFERENCES public.divisions(id),
  to_division_id UUID REFERENCES public.divisions(id),
  from_roll_number TEXT,
  to_roll_number TEXT,
  promotion_type TEXT NOT NULL DEFAULT 'promoted' CHECK (promotion_type IN ('promoted', 'demoted', 'transferred')),
  promoted_by UUID,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promotion_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view promotion history"
ON public.promotion_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert promotion history"
ON public.promotion_history FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete promotion history"
ON public.promotion_history FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_promotion_history_student ON public.promotion_history(student_id);
CREATE INDEX idx_promotion_history_session ON public.promotion_history(to_session_id);
