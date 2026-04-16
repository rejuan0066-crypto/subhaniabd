
CREATE TABLE public.manual_payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_type TEXT NOT NULL DEFAULT 'bkash',
  method_name TEXT NOT NULL,
  method_name_bn TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT DEFAULT NULL,
  account_holder_bn TEXT DEFAULT NULL,
  qr_code_url TEXT DEFAULT NULL,
  instructions TEXT DEFAULT NULL,
  instructions_bn TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.manual_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active manual payment methods"
ON public.manual_payment_methods
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage manual payment methods"
ON public.manual_payment_methods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
