import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SystemConfig {
  id: string;
  nome_sistema: string;
  cor_primaria: string;
  cor_secundaria: string;
  logo_url: string | null;
}

const DEFAULT_CONFIG: SystemConfig = {
  id: '',
  nome_sistema: 'NextApps',
  cor_primaria: '#22C55E',
  cor_secundaria: '#3B82F6',
  logo_url: null,
};

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          nome_sistema: data.nome_sistema,
          cor_primaria: data.cor_primaria,
          cor_secundaria: data.cor_secundaria,
          logo_url: data.logo_url,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (updates: Partial<Omit<SystemConfig, 'id'>>) => {
    try {
      if (!config.id) {
        // Insert new config
        const { data, error } = await supabase
          .from('system_config')
          .insert({
            nome_sistema: updates.nome_sistema || DEFAULT_CONFIG.nome_sistema,
            cor_primaria: updates.cor_primaria || DEFAULT_CONFIG.cor_primaria,
            cor_secundaria: updates.cor_secundaria || DEFAULT_CONFIG.cor_secundaria,
            logo_url: updates.logo_url || null,
          })
          .select()
          .single();

        if (error) throw error;

        setConfig({
          id: data.id,
          nome_sistema: data.nome_sistema,
          cor_primaria: data.cor_primaria,
          cor_secundaria: data.cor_secundaria,
          logo_url: data.logo_url,
        });
      } else {
        // Update existing config
        const { error } = await supabase
          .from('system_config')
          .update({
            ...updates,
          })
          .eq('id', config.id);

        if (error) throw error;

        setConfig(prev => ({
          ...prev,
          ...updates,
        }));
      }

      toast.success('Configurações salvas!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
      return false;
    }
  };

  return {
    config,
    isLoading,
    updateConfig,
    refresh: fetchConfig,
  };
}
