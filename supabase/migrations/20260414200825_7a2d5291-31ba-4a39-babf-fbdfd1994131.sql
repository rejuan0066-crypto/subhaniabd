
-- Create expense_institutions table
CREATE TABLE public.expense_institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.expense_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_institutions ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin-only access like other expense tables)
CREATE POLICY "Authenticated users can view expense_institutions"
  ON public.expense_institutions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert expense_institutions"
  ON public.expense_institutions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update expense_institutions"
  ON public.expense_institutions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete expense_institutions"
  ON public.expense_institutions FOR DELETE TO authenticated USING (true);

-- Add institution_id column to expense_categories (nullable for backward compat)
ALTER TABLE public.expense_categories ADD COLUMN institution_id UUID REFERENCES public.expense_institutions(id) ON DELETE SET NULL;

-- Seed a default 'General' institution for every existing project
INSERT INTO public.expense_institutions (project_id, name, name_bn)
SELECT id, 'General', 'সাধারণ শাখা'
FROM public.expense_projects;

-- Link all existing categories to their project's default 'General' institution
UPDATE public.expense_categories
SET institution_id = ei.id
FROM public.expense_institutions ei
WHERE expense_categories.project_id = ei.project_id
  AND ei.name = 'General';
