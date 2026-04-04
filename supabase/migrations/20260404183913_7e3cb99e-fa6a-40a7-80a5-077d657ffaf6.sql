
-- Receipt counter table for atomic serial numbering
CREATE TABLE public.receipt_counter (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prefix text NOT NULL DEFAULT 'SL',
  current_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now())::integer,
  last_number integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial row
INSERT INTO public.receipt_counter (prefix, current_year, last_number)
VALUES ('SL', EXTRACT(YEAR FROM now())::integer, 0);

-- Enable RLS
ALTER TABLE public.receipt_counter ENABLE ROW LEVEL SECURITY;

-- Only admins and staff can use the counter
CREATE POLICY "Admins can manage receipt_counter" ON public.receipt_counter
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view receipt_counter" ON public.receipt_counter
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- Atomic function to get next serial number
CREATE OR REPLACE FUNCTION public.get_next_receipt_serial()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prefix text;
  v_year integer;
  v_next integer;
  v_current_year integer;
BEGIN
  v_current_year := EXTRACT(YEAR FROM now())::integer;
  
  -- Lock the row for update to prevent race conditions
  SELECT prefix, current_year, last_number
  INTO v_prefix, v_year, v_next
  FROM public.receipt_counter
  LIMIT 1
  FOR UPDATE;
  
  -- If year changed, reset counter
  IF v_year != v_current_year THEN
    v_next := 1;
    UPDATE public.receipt_counter
    SET current_year = v_current_year, last_number = 1, updated_at = now();
  ELSE
    v_next := v_next + 1;
    UPDATE public.receipt_counter
    SET last_number = v_next, updated_at = now();
  END IF;
  
  -- Return formatted serial: SL-2026-0001
  RETURN v_prefix || '-' || v_current_year::text || '-' || lpad(v_next::text, 4, '0');
END;
$$;
