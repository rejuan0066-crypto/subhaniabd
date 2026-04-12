ALTER TABLE public.designations
ADD COLUMN staff_category TEXT NOT NULL DEFAULT 'general';

COMMENT ON COLUMN public.designations.staff_category IS 'Category: teacher, administrative, general';