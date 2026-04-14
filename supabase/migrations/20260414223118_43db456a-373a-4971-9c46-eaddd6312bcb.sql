
-- 1. Create system_logs table
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view system logs"
ON public.system_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert logs (via trigger - security definer)
CREATE POLICY "System can insert logs"
ON public.system_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_system_logs_table ON public.system_logs(table_name);
CREATE INDEX idx_system_logs_created ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_user ON public.system_logs(user_id);

-- 2. Add deleted_at to salary_records if not exists
ALTER TABLE public.salary_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 3. Create generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_old JSONB := NULL;
  v_new JSONB := NULL;
  v_record_id TEXT;
  v_user_id UUID;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_new := to_jsonb(NEW);
    v_record_id := NEW.id::TEXT;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a soft delete
    IF NEW.deleted_at IS NOT NULL AND (OLD.deleted_at IS NULL) THEN
      v_action := 'SOFT_DELETE';
    ELSE
      v_action := 'UPDATE';
    END IF;
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record_id := NEW.id::TEXT;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_old := to_jsonb(OLD);
    v_record_id := OLD.id::TEXT;
  END IF;

  -- Try to get current user
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  INSERT INTO public.system_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (v_user_id, v_action, TG_TABLE_NAME, v_record_id, v_old, v_new);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Attach triggers to critical tables
CREATE TRIGGER audit_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_fee_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_salary_records
  AFTER INSERT OR UPDATE OR DELETE ON public.salary_records
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_students
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_staff
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
