-- Add new staff category roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'administrative';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'general';