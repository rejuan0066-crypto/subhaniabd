
-- Library Books Inventory
CREATE TABLE public.library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_bn text,
  author text,
  author_bn text,
  class_id uuid REFERENCES public.classes(id),
  subject_id uuid REFERENCES public.subjects(id),
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  buying_price numeric NOT NULL DEFAULT 0,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  lost_copies integer NOT NULL DEFAULT 0,
  damaged_copies integer NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT 'new',
  purchased_by text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage library_books" ON public.library_books
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can manage library_books" ON public.library_books
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Anyone can view library_books" ON public.library_books
  FOR SELECT TO public USING (true);

-- Library Issuances (Issue/Distribution Log)
CREATE TABLE public.library_issuances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  recipient_type text NOT NULL DEFAULT 'student',
  student_id uuid REFERENCES public.students(id),
  staff_id uuid REFERENCES public.staff(id),
  recipient_name text,
  distribution_type text NOT NULL DEFAULT 'free',
  selling_price numeric DEFAULT 0,
  book_condition text NOT NULL DEFAULT 'new',
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  returned_date date,
  status text NOT NULL DEFAULT 'issued',
  issued_by uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.library_issuances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage library_issuances" ON public.library_issuances
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can manage library_issuances" ON public.library_issuances
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Anyone can view library_issuances" ON public.library_issuances
  FOR SELECT TO public USING (true);

-- Library Fines
CREATE TABLE public.library_fines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id uuid NOT NULL REFERENCES public.library_issuances(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.library_books(id),
  fine_type text NOT NULL DEFAULT 'lost',
  fine_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.library_fines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage library_fines" ON public.library_fines
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can manage library_fines" ON public.library_fines
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));
