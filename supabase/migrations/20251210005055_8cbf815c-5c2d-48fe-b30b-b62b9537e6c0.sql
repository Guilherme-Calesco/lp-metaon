-- Create table for sellers (vendedores)
CREATE TABLE public.vendedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  foto_url TEXT,
  cargo TEXT DEFAULT 'Vendedor(a)',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily records (dados diarios)
CREATE TABLE public.dados_diarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id UUID NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  calls INTEGER NOT NULL DEFAULT 0,
  leads_atendidos INTEGER NOT NULL DEFAULT 0,
  vendas INTEGER NOT NULL DEFAULT 0,
  valor_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_entrada DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for dashboard display)
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_diarios ENABLE ROW LEVEL SECURITY;

-- Public read access for both tables (dashboard needs to read)
CREATE POLICY "Anyone can view vendedores" 
ON public.vendedores 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view dados_diarios" 
ON public.dados_diarios 
FOR SELECT 
USING (true);

-- Public write access (no auth for simplicity - internal tool)
CREATE POLICY "Anyone can insert vendedores" 
ON public.vendedores 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update vendedores" 
ON public.vendedores 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete vendedores" 
ON public.vendedores 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can insert dados_diarios" 
ON public.dados_diarios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update dados_diarios" 
ON public.dados_diarios 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete dados_diarios" 
ON public.dados_diarios 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for vendedores
CREATE TRIGGER update_vendedores_updated_at
BEFORE UPDATE ON public.vendedores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for dashboard auto-refresh
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendedores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dados_diarios;

-- Create index for faster queries
CREATE INDEX idx_dados_diarios_vendedor ON public.dados_diarios(vendedor_id);
CREATE INDEX idx_dados_diarios_data ON public.dados_diarios(data);