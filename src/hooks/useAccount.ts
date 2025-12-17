import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  gateway_customer_id: string | null;
  gateway_provider: string | null;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  last_four_digits: string | null;
  brand: string | null;
  exp_month: number | null;
  exp_year: number | null;
  is_default: boolean;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval: string;
  interval_count: number;
  features: unknown[];
}

export function useAccount() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccountData = useCallback(async () => {
    if (!user) {
      setCustomer(null);
      setPaymentMethods([]);
      setSubscription(null);
      setPlan(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch customer data
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerData) {
        setCustomer(customerData as Customer);

        // Fetch payment methods
        const { data: methodsData } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('is_default', { ascending: false });

        setPaymentMethods((methodsData || []) as PaymentMethod[]);

        // Fetch active subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customerData.id)
          .in('status', ['active', 'trialing', 'past_due'])
          .maybeSingle();

        if (subData) {
          setSubscription(subData as Subscription);

          // Fetch plan details
          const { data: planData } = await supabase
            .from('plans')
            .select('*')
            .eq('id', subData.plan_id)
            .maybeSingle();

          setPlan(planData as Plan | null);
        } else {
          setSubscription(null);
          setPlan(null);
        }
      } else {
        setCustomer(null);
        setPaymentMethods([]);
        setSubscription(null);
        setPlan(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da conta:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const cancelSubscription = async () => {
    if (!subscription) {
      toast.error('Nenhuma assinatura ativa');
      return false;
    }

    try {
      // Call edge function to cancel subscription
      const { error } = await supabase.functions.invoke('payment-gateway', {
        body: { 
          action: 'cancel_subscription',
          subscription_id: subscription.id 
        }
      });

      if (error) throw error;

      toast.success('Assinatura cancelada com sucesso');
      await fetchAccountData();
      return true;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error('Erro ao cancelar assinatura');
      return false;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Call edge function to delete account and all data
      const { error } = await supabase.functions.invoke('payment-gateway', {
        body: { 
          action: 'delete_account',
          user_id: user.id 
        }
      });

      if (error) throw error;

      toast.success('Conta excluída com sucesso');
      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta');
      return false;
    }
  };

  const resetData = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Delete all user's vendedores and related data
      const { error: vendedoresError } = await supabase
        .from('vendedores')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (vendedoresError) throw vendedoresError;

      // Delete all metas
      const { error: metasError } = await supabase
        .from('metas')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (metasError) throw metasError;

      // Delete all squads
      const { error: squadsError } = await supabase
        .from('squads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (squadsError) throw squadsError;

      toast.success('Dados zerados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao zerar dados:', error);
      toast.error('Erro ao zerar dados');
      return false;
    }
  };

  const addPaymentMethod = async (type: PaymentMethod['type']) => {
    try {
      // Call edge function to initiate payment method addition
      const { data, error } = await supabase.functions.invoke('payment-gateway', {
        body: { 
          action: 'add_payment_method',
          type 
        }
      });

      if (error) throw error;

      // Return checkout URL or session for payment method addition
      return data;
    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      toast.error('Erro ao adicionar método de pagamento');
      return null;
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const { error } = await supabase.functions.invoke('payment-gateway', {
        body: { 
          action: 'remove_payment_method',
          payment_method_id: paymentMethodId 
        }
      });

      if (error) throw error;

      toast.success('Método de pagamento removido');
      await fetchAccountData();
      return true;
    } catch (error) {
      console.error('Erro ao remover método de pagamento:', error);
      toast.error('Erro ao remover método de pagamento');
      return false;
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const { error } = await supabase.functions.invoke('payment-gateway', {
        body: { 
          action: 'set_default_payment_method',
          payment_method_id: paymentMethodId 
        }
      });

      if (error) throw error;

      toast.success('Método de pagamento padrão atualizado');
      await fetchAccountData();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar método de pagamento:', error);
      toast.error('Erro ao atualizar método de pagamento');
      return false;
    }
  };

  return {
    customer,
    paymentMethods,
    subscription,
    plan,
    isLoading,
    refresh: fetchAccountData,
    cancelSubscription,
    deleteAccount,
    resetData,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
}
