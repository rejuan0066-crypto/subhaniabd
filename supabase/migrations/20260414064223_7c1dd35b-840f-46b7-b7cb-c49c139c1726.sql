-- Drop old trigger that only fired on INSERT
DROP TRIGGER IF EXISTS trg_auto_staff_id ON public.staff;

-- Recreate trigger for both INSERT and UPDATE
CREATE TRIGGER trg_auto_staff_id
BEFORE INSERT OR UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_staff_id();