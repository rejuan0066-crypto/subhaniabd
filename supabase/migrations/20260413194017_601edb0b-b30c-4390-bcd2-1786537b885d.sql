
-- Create staff_categories table
CREATE TABLE public.staff_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description TEXT,
  route_path TEXT,
  color TEXT DEFAULT 'gray',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view staff categories"
ON public.staff_categories FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert staff categories"
ON public.staff_categories FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update staff categories"
ON public.staff_categories FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete staff categories"
ON public.staff_categories FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.staff_categories (key, name, name_bn, route_path, color, sort_order) VALUES
('teacher', 'Teacher', 'শিক্ষক', '/admin/teachers', 'blue', 1),
('administrative', 'Administrative', 'প্রশাসনিক কর্মকর্তা', '/admin/administrative-staff', 'purple', 2),
('support', 'Support Staff', 'অফিস কর্মচারী', '/admin/support-staff', 'cyan', 3),
('general', 'General Staff', 'সহায়ক কর্মী', '/admin/general-staff', 'orange', 4);
