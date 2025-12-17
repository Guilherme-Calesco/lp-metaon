import { useState, useEffect, useCallback, useRef } from 'react';
import { VendedorMetrics } from '@/types/dashboard';

interface CelebrationEvent {
  vendedor: {
    nome: string;
    fotoUrl?: string;
  };
  message: string;
  id: string;
}

export function useCelebration(data: VendedorMetrics[]) {
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const previousDataRef = useRef<VendedorMetrics[]>([]);
  const previousLeaderRef = useRef<string | null>(null);

  const triggerCelebration = useCallback((vendedor: { nome: string; fotoUrl?: string }, message: string) => {
    setCelebration({
      vendedor,
      message,
      id: `${Date.now()}-${Math.random()}`
    });
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  // Detect changes and trigger celebrations
  useEffect(() => {
    if (data.length === 0) return;

    const previousData = previousDataRef.current;
    const previousLeader = previousLeaderRef.current;
    const currentLeader = data[0];

    // Check for new leader
    if (currentLeader && previousLeader && currentLeader.vendedor.id !== previousLeader) {
      triggerCelebration(
        { nome: currentLeader.vendedor.nome, fotoUrl: currentLeader.vendedor.fotoUrl },
        '🥇 Assumiu o 1º lugar!'
      );
    } else if (previousData.length > 0) {
      // Check for valor entrada increase (new sale made)
      for (const current of data) {
        const previous = previousData.find(p => p.vendedor.id === current.vendedor.id);
        if (previous && current.valorEntrada > previous.valorEntrada) {
          const valueDiff = current.valorEntrada - previous.valorEntrada;
          const formattedValue = valueDiff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          triggerCelebration(
            { nome: current.vendedor.nome, fotoUrl: current.vendedor.fotoUrl },
            `🎯 +${formattedValue} em entrada!`
          );
          break; // Only one celebration at a time
        }
      }
    }

    // Update refs for next comparison
    previousDataRef.current = data.map(d => ({ ...d }));
    previousLeaderRef.current = currentLeader?.vendedor.id || null;
  }, [data, triggerCelebration]);

  return {
    celebration,
    triggerCelebration,
    dismissCelebration
  };
}
