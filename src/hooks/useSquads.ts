import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Squad } from '@/types/dashboard';

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSquads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('squads')
        .select('*')
        .order('nome');

      if (fetchError) throw fetchError;

      setSquads(
        (data || []).map((s) => ({
          id: s.id,
          nome: s.nome,
          cor: s.cor || '#3B82F6',
          fotoUrl: s.foto_url || undefined,
        }))
      );
    } catch (err) {
      console.error('Error fetching squads:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar squads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSquad = async (nome: string, cor: string, fotoUrl?: string) => {
    const { error } = await supabase.from('squads').insert({ 
      nome, 
      cor,
      foto_url: fotoUrl || null 
    });
    if (error) throw error;
    await fetchSquads();
  };

  const updateSquad = async (id: string, nome: string, cor: string, fotoUrl?: string) => {
    const { error } = await supabase
      .from('squads')
      .update({ 
        nome, 
        cor,
        foto_url: fotoUrl || null 
      })
      .eq('id', id);
    if (error) throw error;
    await fetchSquads();
  };

  const deleteSquad = async (id: string) => {
    // First remove squad_id from all vendedores in this squad
    await supabase
      .from('vendedores')
      .update({ squad_id: null })
      .eq('squad_id', id);

    const { error } = await supabase.from('squads').delete().eq('id', id);
    if (error) throw error;
    await fetchSquads();
  };

  const assignVendedorToSquad = async (vendedorId: string, squadId: string | null) => {
    const { error } = await supabase
      .from('vendedores')
      .update({ squad_id: squadId })
      .eq('id', vendedorId);
    if (error) throw error;
  };

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('squads-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'squads' },
        () => fetchSquads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSquads]);

  return {
    squads,
    isLoading,
    error,
    addSquad,
    updateSquad,
    deleteSquad,
    assignVendedorToSquad,
    refresh: fetchSquads,
  };
}
