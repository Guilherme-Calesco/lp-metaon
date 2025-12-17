-- Create table for monthly goals
CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes date NOT NULL, -- First day of the month
  valor_entrada_meta numeric NOT NULL DEFAULT 0,
  valor_vendas_meta numeric NOT NULL DEFAULT 0,
  vendas_meta integer NOT NULL DEFAULT 0,
  calls_meta integer NOT NULL DEFAULT 0,
  leads_meta integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(mes)
);

-- Enable RLS
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Anyone can view metas
CREATE POLICY "Anyone can view metas"
ON public.metas
FOR SELECT
USING (true);

-- Only admins can insert metas
CREATE POLICY "Admins can insert metas"
ON public.metas
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update metas
CREATE POLICY "Admins can update metas"
ON public.metas
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete metas
CREATE POLICY "Admins can delete metas"
ON public.metas
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_metas_updated_at
BEFORE UPDATE ON public.metas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();