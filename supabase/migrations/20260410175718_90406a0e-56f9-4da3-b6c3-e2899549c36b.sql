CREATE POLICY "Anyone can submit staff applications"
ON public.staff
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');