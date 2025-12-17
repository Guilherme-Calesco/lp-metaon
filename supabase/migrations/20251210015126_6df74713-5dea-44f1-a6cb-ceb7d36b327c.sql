-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update vendedores policies: public read, admin write
DROP POLICY IF EXISTS "Anyone can delete vendedores" ON public.vendedores;
DROP POLICY IF EXISTS "Anyone can insert vendedores" ON public.vendedores;
DROP POLICY IF EXISTS "Anyone can update vendedores" ON public.vendedores;
DROP POLICY IF EXISTS "Anyone can view vendedores" ON public.vendedores;

CREATE POLICY "Anyone can view vendedores"
ON public.vendedores
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert vendedores"
ON public.vendedores
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vendedores"
ON public.vendedores
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vendedores"
ON public.vendedores
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update dados_diarios policies: public read, admin write
DROP POLICY IF EXISTS "Anyone can delete dados_diarios" ON public.dados_diarios;
DROP POLICY IF EXISTS "Anyone can insert dados_diarios" ON public.dados_diarios;
DROP POLICY IF EXISTS "Anyone can update dados_diarios" ON public.dados_diarios;
DROP POLICY IF EXISTS "Anyone can view dados_diarios" ON public.dados_diarios;

CREATE POLICY "Anyone can view dados_diarios"
ON public.dados_diarios
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert dados_diarios"
ON public.dados_diarios
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dados_diarios"
ON public.dados_diarios
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dados_diarios"
ON public.dados_diarios
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));