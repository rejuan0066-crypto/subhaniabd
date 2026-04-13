
-- Add staff_id column to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_id TEXT UNIQUE;

-- Add id_prefix and id_start_range to staff_categories
ALTER TABLE public.staff_categories ADD COLUMN IF NOT EXISTS id_prefix TEXT;
ALTER TABLE public.staff_categories ADD COLUMN IF NOT EXISTS id_start_range INTEGER DEFAULT 1001;

-- Update existing categories with defaults
UPDATE public.staff_categories SET id_prefix = 'ADM', id_start_range = 1001 WHERE key = 'administrative';
UPDATE public.staff_categories SET id_prefix = 'TCH', id_start_range = 2001 WHERE key = 'teacher';
UPDATE public.staff_categories SET id_prefix = 'OFF', id_start_range = 3001 WHERE key = 'general';
UPDATE public.staff_categories SET id_prefix = 'STF', id_start_range = 4001 WHERE key = 'support';

-- Create the staff ID generation function
CREATE OR REPLACE FUNCTION public.generate_staff_id(p_category_key TEXT, p_joining_year INTEGER DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_start_range INTEGER;
  v_year INTEGER;
  v_max_serial INTEGER;
  v_next_serial INTEGER;
  v_new_id TEXT;
BEGIN
  -- Get the category config (lock the row to prevent race conditions)
  SELECT id_prefix, id_start_range INTO v_prefix, v_start_range
  FROM public.staff_categories
  WHERE key = p_category_key AND is_active = true
  LIMIT 1
  FOR UPDATE;

  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'No ID prefix configured for category: %', p_category_key;
  END IF;

  -- Use provided year or current year
  v_year := COALESCE(p_joining_year, EXTRACT(YEAR FROM now())::INTEGER);

  -- Find the max serial number for this prefix+year combination
  SELECT MAX(
    CASE 
      WHEN staff_id ~ ('^' || v_prefix || '-' || v_year::TEXT || '-[0-9]+$')
      THEN CAST(split_part(staff_id, '-', 3) AS INTEGER)
      ELSE NULL
    END
  ) INTO v_max_serial
  FROM public.staff
  WHERE staff_id LIKE v_prefix || '-' || v_year::TEXT || '-%';

  -- Determine next serial: max+1 or start_range (whichever is higher)
  IF v_max_serial IS NULL THEN
    v_next_serial := v_start_range;
  ELSE
    v_next_serial := GREATEST(v_max_serial + 1, v_start_range);
  END IF;

  -- Format: PREFIX-YEAR-SERIAL (e.g., TCH-2025-2001)
  v_new_id := v_prefix || '-' || v_year::TEXT || '-' || v_next_serial::TEXT;

  -- Double-check uniqueness
  WHILE EXISTS (SELECT 1 FROM public.staff WHERE staff_id = v_new_id) LOOP
    v_next_serial := v_next_serial + 1;
    v_new_id := v_prefix || '-' || v_year::TEXT || '-' || v_next_serial::TEXT;
  END LOOP;

  RETURN v_new_id;
END;
$$;

-- Create trigger function to auto-generate staff_id on insert
CREATE OR REPLACE FUNCTION public.auto_generate_staff_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year INTEGER;
BEGIN
  -- Only generate if staff_id is not already set
  IF NEW.staff_id IS NULL OR NEW.staff_id = '' THEN
    -- Extract year from joining_date, fallback to current year
    IF NEW.joining_date IS NOT NULL THEN
      v_year := EXTRACT(YEAR FROM NEW.joining_date::DATE);
    ELSE
      v_year := EXTRACT(YEAR FROM now())::INTEGER;
    END IF;

    NEW.staff_id := public.generate_staff_id(NEW.staff_category, v_year);
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on staff table
DROP TRIGGER IF EXISTS trg_auto_staff_id ON public.staff;
CREATE TRIGGER trg_auto_staff_id
BEFORE INSERT ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_staff_id();

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_staff_staff_id ON public.staff(staff_id);
