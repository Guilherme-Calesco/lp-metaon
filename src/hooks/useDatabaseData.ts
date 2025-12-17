import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendedorMetrics, SquadMetrics, Squad, PaymentMethodStat } from '@/types/dashboard';
import { METODOS_PAGAMENTO } from '@/hooks/useVendasIndividuais';

const AUTO_REFRESH_INTERVAL = 30000; // 30 segundos

export function useDatabaseData(selectedMonth?: Date) {
  const [data, setData] = useState<VendedorMetrics[]>([]);
  const [squadData, setSquadData] = useState<SquadMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const previousRankingRef = useRef<Map<string, number>>(new Map());

  // Use current month if not provided
  const currentMonth = selectedMonth || new Date();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch vendedores with squad info
      const { data: vendedores, error: vendedoresError } = await supabase
        .from('vendedores')
        .select('*');

      if (vendedoresError) throw vendedoresError;

      // Fetch squads
      const { data: squads, error: squadsError } = await supabase
        .from('squads')
        .select('*')
        .order('nome');

      if (squadsError) throw squadsError;

      if (!vendedores || vendedores.length === 0) {
        setData([]);
        setSquadData([]);
        setIsConnected(true);
        setIsLoading(false);
        return;
      }

      // Calculate date range for the selected month
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch dados_diarios filtered by month
      const { data: dadosDiarios, error: dadosError } = await supabase
        .from('dados_diarios')
        .select('*')
        .gte('data', startDateStr)
        .lte('data', endDateStr);

      if (dadosError) throw dadosError;

      // Fetch vendas_individuais filtered by month for payment method stats
      const { data: vendasIndividuais, error: vendasIndError } = await supabase
        .from('vendas_individuais')
        .select('*')
        .gte('data', startDateStr)
        .lte('data', endDateStr);

      if (vendasIndError) throw vendasIndError;

      // Calculate payment method stats per vendedor (handles multiple methods per sale)
      const getPaymentMethodStats = (vendedorId: string): PaymentMethodStat[] => {
        const vendedorVendas = (vendasIndividuais || []).filter(v => v.vendedor_id === vendedorId);
        if (vendedorVendas.length === 0) return [];

        const counts: Record<string, number> = {};
        vendedorVendas.forEach(v => {
          // Split multiple payment methods (comma-separated)
          v.metodo_pagamento.split(',').forEach(m => {
            const metodo = m.trim();
            counts[metodo] = (counts[metodo] || 0) + 1;
          });
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return Object.entries(counts)
          .map(([metodo, count]) => ({
            metodo,
            label: METODOS_PAGAMENTO.find(m => m.value === metodo)?.label || metodo,
            count,
            percentage: ((count / total) * 100).toFixed(0),
          }))
          .sort((a, b) => b.count - a.count);
      };

      // Aggregate data by vendedor
      const aggregatedData: VendedorMetrics[] = vendedores.map((vendedor) => {
        const vendedorDados = (dadosDiarios || []).filter(
          (d) => d.vendedor_id === vendedor.id
        );

        // Get vendas from vendas_individuais for this vendedor
        const vendedorVendas = (vendasIndividuais || []).filter(
          (v) => v.vendedor_id === vendedor.id
        );
        
        // Count vendas by type from vendas_individuais
        const vendasCallsFromIndividuais = vendedorVendas.filter(v => v.tipo_venda === 'call').length;
        const vendasLeadsFromIndividuais = vendedorVendas.filter(v => v.tipo_venda === 'lead').length;
        
        // Sum valores from vendas_individuais - ensure proper numeric conversion
        const valorTotalFromVendas = vendedorVendas.reduce((acc, v) => {
          const valor = parseFloat(String(v.valor_venda)) || 0;
          return acc + valor;
        }, 0);
        const valorEntradaFromVendas = vendedorVendas.reduce((acc, v) => {
          const valor = parseFloat(String(v.valor_entrada)) || 0;
          return acc + valor;
        }, 0);

        const totals = vendedorDados.reduce(
          (acc, d) => ({
            totalCalls: acc.totalCalls + (d.calls || 0),
            totalLeads: acc.totalLeads + (d.leads_atendidos || 0),
          }),
          { totalCalls: 0, totalLeads: 0 }
        );
        
        const totalVendas = vendasCallsFromIndividuais + vendasLeadsFromIndividuais;

        return {
          vendedor: {
            id: vendedor.id,
            nome: vendedor.nome,
            cargo: vendedor.cargo || 'Vendedor(a)',
            fotoUrl: vendedor.foto_url || undefined,
            squadId: vendedor.squad_id || undefined,
          },
          totalVendas,
          valorTotal: valorTotalFromVendas,
          valorEntrada: valorEntradaFromVendas,
          totalCalls: totals.totalCalls,
          totalLeads: totals.totalLeads,
          vendasCalls: vendasCallsFromIndividuais,
          vendasLeads: vendasLeadsFromIndividuais,
          vendasCall: vendasCallsFromIndividuais,
          vendasWhatsapp: vendasLeadsFromIndividuais,
          taxaConversao: totals.totalLeads > 0 
            ? (totalVendas / totals.totalLeads) * 100 
            : 0,
          tendenciaVendas: [],
          paymentMethodStats: getPaymentMethodStats(vendedor.id),
        };
      });

      // Sort by entry value descending (primary criterion)
      const sortedData = aggregatedData.sort((a, b) => b.valorEntrada - a.valorEntrada);

      // Add previous position for trend indicator
      const dataWithTrend = sortedData.map((item, index) => {
        const previousPosition = previousRankingRef.current.get(item.vendedor.id);
        return {
          ...item,
          posicaoAnterior: previousPosition,
        };
      });

      // Update previous ranking for next comparison
      const newRankingMap = new Map<string, number>();
      sortedData.forEach((item, index) => {
        newRankingMap.set(item.vendedor.id, index + 1);
      });
      previousRankingRef.current = newRankingMap;

      setData(dataWithTrend);

      // Aggregate by squad
      if (squads && squads.length > 0) {
        const squadMetrics: SquadMetrics[] = squads.map((squad) => {
          const squadVendedores = dataWithTrend.filter(
            (v) => v.vendedor.squadId === squad.id
          );

          const squadTotals = squadVendedores.reduce(
            (acc, v) => ({
              totalVendas: acc.totalVendas + v.totalVendas,
              valorTotal: acc.valorTotal + v.valorTotal,
              valorEntrada: acc.valorEntrada + v.valorEntrada,
              totalCalls: acc.totalCalls + v.totalCalls,
              totalLeads: acc.totalLeads + v.totalLeads,
            }),
            { totalVendas: 0, valorTotal: 0, valorEntrada: 0, totalCalls: 0, totalLeads: 0 }
          );

          return {
            squad: {
              id: squad.id,
              nome: squad.nome,
              cor: squad.cor || '#3B82F6',
              fotoUrl: squad.foto_url || undefined,
            },
            vendedores: squadVendedores,
            ...squadTotals,
            taxaConversao: squadTotals.totalLeads > 0
              ? (squadTotals.totalVendas / squadTotals.totalLeads) * 100
              : 0,
          };
        }).filter(s => s.vendedores.length > 0); // Only show squads with vendedores

        // Sort squads by valorEntrada
        squadMetrics.sort((a, b) => b.valorEntrada - a.valorEntrada);
        setSquadData(squadMetrics);
      } else {
        setSquadData([]);
      }

      setIsConnected(true);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setData([]);
      setSquadData([]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  // Fetch when month changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendedores' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dados_diarios' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'squads' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendas_individuais' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return {
    data,
    squadData,
    isLoading,
    error,
    lastUpdate,
    isConnected,
    refresh: fetchData,
  };
}
