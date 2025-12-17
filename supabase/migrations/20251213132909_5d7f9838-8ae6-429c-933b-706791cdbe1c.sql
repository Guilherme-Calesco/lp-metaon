-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');

-- Create enum for payment method type
CREATE TYPE public.payment_method_type AS ENUM ('credit_card', 'debit_card', 'pix', 'boleto');

-- Create customers table (links to payment gateway customer)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  gateway_customer_id TEXT UNIQUE,
  gateway_provider TEXT DEFAULT 'stripe',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type payment_method_type NOT NULL,
  gateway_payment_method_id TEXT UNIQUE,
  last_four_digits TEXT,
  brand TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  interval TEXT NOT NULL DEFAULT 'month',
  interval_count INTEGER NOT NULL DEFAULT 1,
  gateway_plan_id TEXT UNIQUE,
  gateway_price_id TEXT UNIQUE,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  gateway_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments/invoices table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_payment_id TEXT UNIQUE,
  gateway_invoice_id TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view their own customer data"
ON public.customers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data"
ON public.customers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all customers"
ON public.customers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = payment_methods.customer_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = payment_methods.customer_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Users can update their own payment methods"
ON public.payment_methods FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = payment_methods.customer_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own payment methods"
ON public.payment_methods FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = payment_methods.customer_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all payment methods"
ON public.payment_methods FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for plans (public read, admin manage)
CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all plans"
ON public.plans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = subscriptions.customer_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = payments.customer_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_gateway_customer_id ON public.customers(gateway_customer_id);
CREATE INDEX idx_payment_methods_customer_id ON public.payment_methods(customer_id);
CREATE INDEX idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_payments_status ON public.payments(status);