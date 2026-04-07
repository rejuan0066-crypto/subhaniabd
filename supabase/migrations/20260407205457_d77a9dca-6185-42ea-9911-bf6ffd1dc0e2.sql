-- Allow staff and teachers to update receipt_counter (needed for RPC fallback)
CREATE POLICY "Staff can manage receipt_counter"
ON public.receipt_counter
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- Grant execute on the function to all authenticated users
GRANT EXECUTE ON FUNCTION public.get_next_receipt_serial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_receipt_serial() TO anon;