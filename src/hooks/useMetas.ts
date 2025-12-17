import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Meta {
  id: string;
  mes: string;
  valor_entrada_meta: number;
  valor_vendas_meta: number;
  vendas_meta: number;
  calls_meta: number;
  leads_meta: number;
}

export function useMetas(selectedMonth?: Date) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentMonth = selectedMonth || new Date();
  const mesStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`;

  const fetchMeta = useCallback(async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('mes', mesStr)
      .maybeSingle();

    if (error) {
      console.error('Error fetching meta:', error);
      setMeta(null);
    } else {
      setMeta(data);
    }
    
    setIsLoading(false);
  }, [mesStr]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const saveMeta = async (metaData: Omit<Meta, 'id'>) => {
    const existing = await supabase
      .from('metas')
      .select('id')
      .eq('mes', metaData.mes)
      .maybeSingle();

    if (existing.data) {
      const { error } = await supabase
        .from('metas')
        .update({
          valor_entrada_meta: metaData.valor_entrada_meta,
          valor_vendas_meta: metaData.valor_vendas_meta,
          vendas_meta: metaData.vendas_meta,
          calls_meta: metaData.calls_meta,
          leads_meta: metaData.leads_meta,
        })
        .eq('id', existing.data.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('metas')
        .insert(metaData);

      if (error) throw error;
    }

    await fetchMeta();
  };

  return {
    meta,
    isLoading,
    saveMeta,
    refresh: fetchMeta,
  };
}
