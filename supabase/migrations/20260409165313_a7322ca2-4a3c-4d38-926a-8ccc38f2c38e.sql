
ALTER TABLE public.fee_types 
ADD COLUMN payment_frequency text NOT NULL DEFAULT 'one-time';
