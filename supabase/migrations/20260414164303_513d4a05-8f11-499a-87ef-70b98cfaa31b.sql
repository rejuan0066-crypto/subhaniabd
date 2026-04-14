
-- Question papers table
CREATE TABLE public.question_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  subject_type TEXT NOT NULL DEFAULT 'bangla',
  class_id UUID REFERENCES public.classes(id),
  division_id UUID REFERENCES public.divisions(id),
  exam_session_id UUID REFERENCES public.exam_sessions(id),
  total_marks INTEGER NOT NULL DEFAULT 100,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  instructions TEXT,
  instructions_bn TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id UUID NOT NULL REFERENCES public.question_papers(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_bn TEXT,
  question_type TEXT NOT NULL DEFAULT 'descriptive',
  marks INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  group_label TEXT,
  group_label_bn TEXT,
  options JSONB,
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage question papers" ON public.question_papers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view question papers" ON public.question_papers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view questions" ON public.questions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));
