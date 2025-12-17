-- Add tipo_venda column to vendas_individuais table
ALTER TABLE public.vendas_individuais 
ADD COLUMN tipo_venda text NOT NULL DEFAULT 'lead' CHECK (tipo_venda IN ('call', 'lead'));