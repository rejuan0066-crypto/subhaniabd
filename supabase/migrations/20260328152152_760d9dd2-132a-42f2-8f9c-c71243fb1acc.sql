-- Add logo_url column to institutions
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for institution logos
INSERT INTO storage.buckets (id, name, public) VALUES ('institution-logos', 'institution-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Anyone can view institution logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'institution-logos');
CREATE POLICY "Admins can manage institution logos" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'institution-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (bucket_id = 'institution-logos' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));