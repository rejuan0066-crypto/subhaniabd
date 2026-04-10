
-- Add is_published to exam_sessions
ALTER TABLE public.exam_sessions ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Add division_id to results (previously came from exams table)
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS division_id uuid REFERENCES public.divisions(id) ON DELETE SET NULL;

-- Drop old foreign key from results -> exams
ALTER TABLE public.results DROP CONSTRAINT IF EXISTS results_exam_id_fkey;

-- Add new foreign key from results -> exam_sessions
ALTER TABLE public.results ADD CONSTRAINT results_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exam_sessions(id) ON DELETE RESTRICT;

-- Drop the old exams table
DROP TABLE IF EXISTS public.exams CASCADE;
