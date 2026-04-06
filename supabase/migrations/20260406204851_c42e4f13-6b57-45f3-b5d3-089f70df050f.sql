
CREATE TABLE public.exam_session_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (exam_session_id, subject_id, class_id)
);

ALTER TABLE public.exam_session_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage exam_session_subjects" ON public.exam_session_subjects
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view exam_session_subjects" ON public.exam_session_subjects
  FOR SELECT TO public USING (true);

CREATE POLICY "Staff can manage exam_session_subjects" ON public.exam_session_subjects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));
