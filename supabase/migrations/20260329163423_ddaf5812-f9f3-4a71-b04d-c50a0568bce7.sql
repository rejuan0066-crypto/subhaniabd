
-- Create storage bucket for website assets (logo, principal photo, gallery images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read website assets" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'website-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload website assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'website-assets');

-- Allow authenticated users to update
CREATE POLICY "Authenticated update website assets" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'website-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated delete website assets" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'website-assets');
