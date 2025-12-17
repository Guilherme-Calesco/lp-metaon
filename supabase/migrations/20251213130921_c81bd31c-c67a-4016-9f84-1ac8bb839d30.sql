-- Add secondary color to system_config
ALTER TABLE public.system_config 
ADD COLUMN cor_secundaria text NOT NULL DEFAULT '#3B82F6';