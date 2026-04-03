-- Drop the existing duplicate and recreate
DROP POLICY IF EXISTS "Staff can view own salary" ON public.salary_records;
CREATE POLICY "Staff can view own salary"
ON public.salary_records
FOR SELECT
TO authenticated
USING (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'staff'::app_role)
  OR public.has_role(auth.uid(), 'teacher'::app_role)
);

-- Attendance policy was already handled, ensure it exists
DROP POLICY IF EXISTS "Staff can manage attendance with permission" ON public.attendance_records;
CREATE POLICY "Staff can manage attendance with permission"
ON public.attendance_records
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'staff'::app_role) 
  OR public.has_role(auth.uid(), 'teacher'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'staff'::app_role) 
  OR public.has_role(auth.uid(), 'teacher'::app_role)
);