-- Add unique constraint to prevent duplicate entries for the same vendedor and date
ALTER TABLE public.dados_diarios 
ADD CONSTRAINT dados_diarios_vendedor_data_unique UNIQUE (vendedor_id, data);