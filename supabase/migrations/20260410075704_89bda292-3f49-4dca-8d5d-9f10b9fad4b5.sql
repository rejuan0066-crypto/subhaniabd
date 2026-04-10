ALTER TABLE public.results DROP CONSTRAINT results_exam_id_fkey;
ALTER TABLE public.results ADD CONSTRAINT results_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE RESTRICT;