import { useState, useEffect, useCallback } from 'react';
import { VendedorMetrics } from '@/types/dashboard';
import { fetchGoogleSheetsData } from '@/services/googleSheets';
import { vendedoresRanking } from '@/data/mockData';
import { toast } from 'sonner';

const REFRESH_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'nexttrack_spreadsheet_url';

export function useGoogleSheets() {
  const [data, setData] = useState<VendedorMetrics[]>(vendedoresRanking);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = useCallback(async () => {
    const spreadsheetUrl = localStorage.getItem(STORAGE_KEY);
    
    if (!spreadsheetUrl) {
      setIsConnected(false);
      setData(vendedoresRanking);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetchGoogleSheetsData(spreadsheetUrl);
      
      // Sort by total sales (descending)
      const sortedData = [...newData].sort((a, b) => b.totalVendas - a.totalVendas);
      
      setData(sortedData);
      setLastUpdate(new Date());
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar dados';
      setError(message);
      setIsConnected(false);
      // Keep using mock data on error
      setData(vendedoresRanking);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Listen for storage changes (when URL is updated in config)
  useEffect(() => {
    const handleStorageChange = () => {
      fetchData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('spreadsheet-url-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('spreadsheet-url-changed', handleStorageChange);
    };
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    isConnected,
    refresh: fetchData,
  };
}
