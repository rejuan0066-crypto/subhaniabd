
-- Step 1: Update institution names to match their parent project names
UPDATE public.expense_institutions ei
SET name = ep.name, name_bn = ep.name_bn
FROM public.expense_projects ep
WHERE ei.project_id = ep.id;

-- Step 2: Add institution_id to expenses table
ALTER TABLE public.expenses ADD COLUMN institution_id UUID REFERENCES public.expense_institutions(id);

-- Step 3: Populate institution_id on expenses from their project_id mapping
UPDATE public.expenses e
SET institution_id = ei.id
FROM public.expense_institutions ei
WHERE ei.project_id = e.project_id;

-- Step 4: Ensure all expense_categories have institution_id set
UPDATE public.expense_categories ec
SET institution_id = ei.id
FROM public.expense_institutions ei
WHERE ei.project_id = ec.project_id AND ec.institution_id IS NULL;

-- Step 5: Drop project_id foreign keys and columns
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_project_id_fkey;
ALTER TABLE public.expenses DROP COLUMN project_id;

ALTER TABLE public.expense_categories DROP CONSTRAINT IF EXISTS expense_categories_project_id_fkey;
ALTER TABLE public.expense_categories DROP COLUMN project_id;

ALTER TABLE public.expense_institutions DROP CONSTRAINT IF EXISTS expense_institutions_project_id_fkey;
ALTER TABLE public.expense_institutions DROP COLUMN project_id;

-- Step 6: Drop the expense_projects table
DROP TABLE IF EXISTS public.expense_projects CASCADE;

-- Step 7: Make institution_id NOT NULL on expenses (all data is mapped now)
ALTER TABLE public.expenses ALTER COLUMN institution_id SET NOT NULL;

-- Step 8: Make institution_id NOT NULL on expense_categories
ALTER TABLE public.expense_categories ALTER COLUMN institution_id SET NOT NULL;
