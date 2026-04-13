
-- Salary savings configuration per staff
CREATE TABLE public.salary_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  monthly_amount NUMERIC NOT NULL DEFAULT 0,
  duration_months INTEGER NOT NULL DEFAULT 1,
  start_month TEXT NOT NULL, -- e.g. '2026-04'
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_saved NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.salary_savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view salary_savings"
  ON public.salary_savings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert salary_savings"
  ON public.salary_savings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update salary_savings"
  ON public.salary_savings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete salary_savings"
  ON public.salary_savings FOR DELETE TO authenticated USING (true);

-- Monthly ledger entries for each deduction
CREATE TABLE public.salary_savings_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  savings_id UUID NOT NULL REFERENCES public.salary_savings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- e.g. '2026-04'
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.salary_savings_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view salary_savings_ledger"
  ON public.salary_savings_ledger FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert salary_savings_ledger"
  ON public.salary_savings_ledger FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update salary_savings_ledger"
  ON public.salary_savings_ledger FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete salary_savings_ledger"
  ON public.salary_savings_ledger FOR DELETE TO authenticated USING (true);

-- Index for fast lookups
CREATE INDEX idx_salary_savings_staff ON public.salary_savings(staff_id);
CREATE INDEX idx_salary_savings_ledger_staff ON public.salary_savings_ledger(staff_id);
CREATE INDEX idx_salary_savings_ledger_month ON public.salary_savings_ledger(month_year);
