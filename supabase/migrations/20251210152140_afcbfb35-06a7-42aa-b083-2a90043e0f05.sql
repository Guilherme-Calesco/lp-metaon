-- Create table for individual sales with payment method
CREATE TABLE public.vendas_individuais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id UUID NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_venda NUMERIC NOT NULL DEFAULT 0,
  valor_entrada NUMERIC NOT NULL DEFAULT 0,
  metodo_pagamento TEXT NOT NULL DEFAULT 'pix',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendas_individuais ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view vendas_individuais"
ON public.vendas_individuais
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert vendas_individuais"
ON public.vendas_individuais
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update vendas_individuais"
ON public.vendas_individuais
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete vendas_individuais"
ON public.vendas_individuais
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for performance
CREATE INDEX idx_vendas_individuais_vendedor_data ON public.vendas_individuais(vendedor_id, data);