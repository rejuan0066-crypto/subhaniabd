
-- Add approval workflow and font config columns to question_papers
ALTER TABLE public.question_papers 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_note TEXT,
  ADD COLUMN IF NOT EXISTS font_config JSONB DEFAULT '{"arabic":"Amiri","bengali":"SutonnyOMJ","english":"Arial","fontSize":14}'::jsonb,
  ADD COLUMN IF NOT EXISTS header_config JSONB DEFAULT '{"showLogo":true,"showInstitutionName":true,"centered":true}'::jsonb;
