
CREATE TABLE public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_bn text NOT NULL,
  description text,
  description_bn text,
  base_role text NOT NULL DEFAULT 'staff',
  permissions_template jsonb DEFAULT '[]'::jsonb,
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom_roles" ON public.custom_roles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view custom_roles" ON public.custom_roles
FOR SELECT TO public
USING (is_active = true);

INSERT INTO public.custom_roles (name, name_bn, description, description_bn, base_role, is_system, sort_order) VALUES
  ('admin', 'অ্যাডমিন', 'Full system administrator', 'সম্পূর্ণ সিস্টেম অ্যাডমিনিস্ট্রেটর', 'admin', true, 1),
  ('teacher', 'শিক্ষক', 'Teacher with limited access', 'সীমিত অ্যাক্সেস সহ শিক্ষক', 'teacher', true, 2),
  ('staff', 'স্টাফ', 'Staff member with limited access', 'সীমিত অ্যাক্সেস সহ স্টাফ সদস্য', 'staff', true, 3);
