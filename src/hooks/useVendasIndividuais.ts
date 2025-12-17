import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VendaIndividual {
  id: string;
  vendedor_id: string;
  data: string;
  valor_venda: number;
  valor_entrada: number;
  metodo_pagamento: string;
  tipo_venda: string;
  created_at: string;
}

export const METODOS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
];

export function useVendasIndividuais(vendedorId?: string, selectedMonth?: Date) {
  const [vendas, setVendas] = useState<VendaIndividual[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVendas = useCallback(async () => {
    if (!selectedMonth) {
      setVendas([]);
      return;
    }

    setIsLoading(true);
    const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    let query = supabase
      .from('vendas_individuais')
      .select('*')
      .gte('data', startDate.toISOString().split('T')[0])
      .lte('data', endDate.toISOString().split('T')[0]);

    if (vendedorId) {
      query = query.eq('vendedor_id', vendedorId);
    }

    const { data, error } = await query.order('data', { ascending: false });

    if (error) {
      console.error('Error fetching vendas individuais:', error);
    } else {
      setVendas(data || []);
    }
    setIsLoading(false);
  }, [vendedorId, selectedMonth]);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  const addVenda = async (venda: Omit<VendaIndividual, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('vendas_individuais').insert(venda);
    if (error) throw error;
    await fetchVendas();
  };

  const deleteVenda = async (id: string) => {
    const { error } = await supabase.from('vendas_individuais').delete().eq('id', id);
    if (error) throw error;
    await fetchVendas();
  };

  return { vendas, isLoading, addVenda, deleteVenda, refresh: fetchVendas };
}

// Hook to get all vendas for dashboard with payment method stats
export function useAllVendasIndividuais(selectedMonth?: Date) {
  const [vendas, setVendas] = useState<VendaIndividual[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVendas = useCallback(async () => {
    if (!selectedMonth) {
      setVendas([]);
      return;
    }

    setIsLoading(true);
    const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('vendas_individuais')
      .select('*')
      .gte('data', startDate.toISOString().split('T')[0])
      .lte('data', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching all vendas individuais:', error);
    } else {
      setVendas(data || []);
    }
    setIsLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  // Calculate payment method distribution
  const getPaymentMethodStats = useCallback((vendedorId?: string) => {
    const filtered = vendedorId ? vendas.filter(v => v.vendedor_id === vendedorId) : vendas;
    const total = filtered.length;
    
    if (total === 0) return [];

    const counts: Record<string, number> = {};
    filtered.forEach(v => {
      counts[v.metodo_pagamento] = (counts[v.metodo_pagamento] || 0) + 1;
    });

    return Object.entries(counts).map(([metodo, count]) => ({
      metodo,
      label: METODOS_PAGAMENTO.find(m => m.value === metodo)?.label || metodo,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    })).sort((a, b) => b.count - a.count);
  }, [vendas]);

  return { vendas, isLoading, getPaymentMethodStats, refresh: fetchVendas };
}
