
CREATE TABLE public.attendance_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'fingerprint',
  ip_address TEXT,
  port INTEGER,
  model TEXT,
  serial_number TEXT,
  location TEXT,
  location_bn TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.attendance_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance devices"
ON public.attendance_devices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
