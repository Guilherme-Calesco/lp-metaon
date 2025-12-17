-- Add columns for sales by channel (calls and leads)
ALTER TABLE public.dados_diarios 
ADD COLUMN vendas_calls integer NOT NULL DEFAULT 0,
ADD COLUMN vendas_leads integer NOT NULL DEFAULT 0;