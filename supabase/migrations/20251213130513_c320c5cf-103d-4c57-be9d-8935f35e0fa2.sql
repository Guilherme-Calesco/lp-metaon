-- Create system configuration table
CREATE TABLE public.system_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_sistema text NOT NULL DEFAULT 'NextApps',
  cor_primaria text NOT NULL DEFAULT '#22C55E',
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Anyone can view the config (needed for the dashboard)
CREATE POLICY "Anyone can view system_config"
ON public.system_config
FOR SELECT
USING (true);

-- Only admins can update/insert/delete
CREATE POLICY "Admins can insert system_config"
ON public.system_config
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update system_config"
ON public.system_config
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete system_config"
ON public.system_config
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.system_config (nome_sistema, cor_primaria)
VALUES ('NextApps', '#22C55E');