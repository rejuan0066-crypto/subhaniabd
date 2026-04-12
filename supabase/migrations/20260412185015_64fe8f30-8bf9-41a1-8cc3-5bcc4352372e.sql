
-- Add deleted_at column to major tables for soft-delete support

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.fee_types ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.fee_payments ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.donors ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.library_books ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Create indexes for performance on soft-delete queries
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON public.students (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staff_deleted_at ON public.staff (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_fee_types_deleted_at ON public.fee_types (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_fee_payments_deleted_at ON public.fee_payments (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at ON public.expenses (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_donors_deleted_at ON public.donors (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notices_deleted_at ON public.notices (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_library_books_deleted_at ON public.library_books (deleted_at) WHERE deleted_at IS NULL;
