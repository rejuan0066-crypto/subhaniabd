
ALTER TABLE public.fee_types
ADD COLUMN session_id UUID REFERENCES public.academic_sessions(id) ON DELETE SET NULL;

CREATE INDEX idx_fee_types_session_id ON public.fee_types(session_id);
