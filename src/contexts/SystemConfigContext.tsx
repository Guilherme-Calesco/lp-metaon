import React, { createContext, useContext, ReactNode } from 'react';
import { useSystemConfig, SystemConfig } from '@/hooks/useSystemConfig';

interface SystemConfigContextType {
  config: SystemConfig;
  isLoading: boolean;
  updateConfig: (updates: Partial<Omit<SystemConfig, 'id'>>) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SystemConfigContext = createContext<SystemConfigContextType | null>(null);

export function SystemConfigProvider({ children }: { children: ReactNode }) {
  const systemConfig = useSystemConfig();

  return (
    <SystemConfigContext.Provider value={systemConfig}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfigContext() {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfigContext must be used within a SystemConfigProvider');
  }
  return context;
}
