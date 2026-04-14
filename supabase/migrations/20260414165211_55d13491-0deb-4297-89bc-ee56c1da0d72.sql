
ALTER TABLE public.question_papers ADD COLUMN subject_id UUID REFERENCES public.subjects(id);
