
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Update existing admin users to 'approved'
UPDATE public.profiles SET status = 'approved' WHERE id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- Update the handle_new_user function to set status as 'pending' by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'pending');
  RETURN NEW;
END;
$function$;
