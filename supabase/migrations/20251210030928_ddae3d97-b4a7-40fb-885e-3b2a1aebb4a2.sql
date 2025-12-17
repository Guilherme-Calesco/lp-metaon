-- Create squads table
CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add squad_id to vendedores
ALTER TABLE public.vendedores ADD COLUMN squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL;

-- Enable RLS on squads
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

-- RLS policies for squads
CREATE POLICY "Anyone can view squads" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Admins can insert squads" ON public.squads FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update squads" ON public.squads FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete squads" ON public.squads FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_squads_updated_at
  BEFORE UPDATE ON public.squads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();