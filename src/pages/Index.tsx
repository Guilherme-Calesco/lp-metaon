import { useState, useMemo } from 'react';
import { PodiumCard } from '@/components/gamification/PodiumCard';
import { SquadSection } from '@/components/gamification/SquadSection';
import { TeamStats } from '@/components/gamification/TeamStats';
import { LiveClock } from '@/components/gamification/LiveClock';
import { CelebrationOverlay } from '@/components/gamification/CelebrationOverlay';
import { useDatabaseData } from '@/hooks/useDatabaseData';
import { useCelebration } from '@/hooks/useCelebration';
import { useMetas } from '@/hooks/useMetas';
import { useSystemConfigContext } from '@/contexts/SystemConfigContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, ChevronLeft, ChevronRight, Sparkles, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'individual' | 'squads'>('individual');
  const { data: vendedoresRanking, squadData, isConnected } = useDatabaseData(selectedMonth);
  const { celebration, triggerCelebration, dismissCelebration } = useCelebration(vendedoresRanking);
  const { meta } = useMetas(selectedMonth);
  const { config: systemConfig } = useSystemConfigContext();
  
  // Parse system name into parts for styling
  const nameParts = useMemo(() => {
    const name = systemConfig.nome_sistema || 'NextApps';
    // Try to split at capital letters (e.g., "NextApps" -> ["Next", "Apps"])
    const parts = name.match(/[A-Z][a-z]*/g);
    if (parts && parts.length >= 2) {
      return { first: parts[0], second: parts.slice(1).join('') };
    }
    return { first: name, second: '' };
  }, [systemConfig.nome_sistema]);
  
  const handleTestCelebration = () => {
    const testVendedor = vendedoresRanking[0]?.vendedor || { nome: 'Teste', fotoUrl: undefined };
    triggerCelebration(
      { nome: testVendedor.nome, fotoUrl: testVendedor.fotoUrl },
      '🎉 Teste de celebração!'
    );
  };
  
  const monthName = selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return selectedMonth.getMonth() === now.getMonth() && 
           selectedMonth.getFullYear() === now.getFullYear();
  }, [selectedMonth]);

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };
  
  // Ordenar por valor de entrada (ranking)
  const sortedRanking = useMemo(() => 
    [...vendedoresRanking].sort((a, b) => b.valorEntrada - a.valorEntrada),
    [vendedoresRanking]
  );

  const totais = useMemo(() => {
    return vendedoresRanking.reduce((acc, v) => ({
      totalVendas: acc.totalVendas + v.totalVendas,
      valorTotal: acc.valorTotal + v.valorTotal,
      valorEntrada: acc.valorEntrada + v.valorEntrada,
      totalCalls: acc.totalCalls + v.totalCalls,
      totalLeads: acc.totalLeads + v.totalLeads,
      vendasCall: acc.vendasCall + v.vendasCall,
      vendasWhatsapp: acc.vendasWhatsapp + v.vendasWhatsapp,
    }), {
      totalVendas: 0,
      valorTotal: 0,
      valorEntrada: 0,
      totalCalls: 0,
      totalLeads: 0,
      vendasCall: 0,
      vendasWhatsapp: 0,
    });
  }, [vendedoresRanking]);

  const hasSquads = squadData.length > 0;

  return (
    <>
      {/* Celebration Overlay */}
      {celebration && (
        <CelebrationOverlay
          vendedor={celebration.vendedor}
          message={celebration.message}
          onComplete={dismissCelebration}
        />
      )}

      <div 
        className="h-screen w-screen p-4 flex flex-col overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${systemConfig.cor_secundaria}15 0%, ${systemConfig.cor_primaria}10 50%, ${systemConfig.cor_secundaria}20 100%)`
        }}
      >
      {/* Header - Compacto */}
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {systemConfig.logo_url ? (
            <img 
              src={systemConfig.logo_url} 
              alt="Logo"
              className="w-8 h-8 rounded-lg object-contain"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${systemConfig.cor_primaria}, ${systemConfig.cor_primaria}88)` 
              }}
            >
              <span className="text-white font-black text-sm">
                {(systemConfig.nome_sistema || 'N').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {nameParts.first}
              <span style={{ color: systemConfig.cor_primaria }}>{nameParts.second}</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {hasSquads && (
            <div className="flex items-center bg-card/60 rounded-lg border border-border p-0.5">
              <Button
                variant={viewMode === 'individual' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 text-[10px] px-2 gap-1"
                onClick={() => setViewMode('individual')}
              >
                <User className="h-3 w-3" />
                Individual
              </Button>
              <Button
                variant={viewMode === 'squads' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 text-[10px] px-2 gap-1"
                onClick={() => setViewMode('squads')}
              >
                <Users className="h-3 w-3" />
                Squads
              </Button>
            </div>
          )}

          {/* Month Filter */}
          <div className="flex items-center gap-1 bg-card/60 rounded-lg border border-border px-1.5 py-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMonth}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium min-w-[100px] text-center capitalize">
              {monthName}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMonth}>
              <ChevronRight className="h-3 w-3" />
            </Button>
            {!isCurrentMonth && (
              <Button variant="outline" size="sm" className="ml-1 h-5 text-[10px] px-2" onClick={goToCurrentMonth}>
                Atual
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-card/60 rounded-lg border border-border">
            <div 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: isConnected ? systemConfig.cor_primaria : '#eab308' }}
            />
            <span className="text-[10px] text-muted-foreground">
              {isConnected ? 'Conectado' : 'Exemplo'}
            </span>
          </div>
          <LiveClock />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 h-6 text-[10px] px-2"
            style={{ 
              borderColor: `${systemConfig.cor_primaria}80`,
              color: systemConfig.cor_primaria 
            }}
            onClick={handleTestCelebration}
          >
            <Sparkles className="h-3 w-3" />
            Testar
          </Button>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-1 h-6 text-[10px] px-2">
              <Settings className="h-3 w-3" />
              Controle
            </Button>
          </Link>
        </div>
      </header>

      {/* Top Metrics Bar - Compacto */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Vendas Totais - fundo secundário, número primário */}
        <div 
          className="rounded-lg p-2 flex items-center gap-2 border"
          style={{ 
            backgroundColor: `${systemConfig.cor_secundaria}25`,
            borderColor: `${systemConfig.cor_secundaria}40`
          }}
        >
          <span className="text-xl">📈</span>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Vendas Totais</p>
            <p className="text-lg font-bold leading-tight" style={{ color: systemConfig.cor_primaria }}>
              {totais.totalVendas}
            </p>
          </div>
        </div>
        {/* Valor Vendas - fundo secundário, número branco */}
        <div 
          className="rounded-lg p-2 flex items-center gap-2 border"
          style={{ 
            backgroundColor: `${systemConfig.cor_secundaria}25`,
            borderColor: `${systemConfig.cor_secundaria}40`
          }}
        >
          <span className="text-xl">💰</span>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Valor Vendas</p>
            <p className="text-lg font-bold leading-tight text-white">
              {formatCurrency(totais.valorTotal)}
            </p>
          </div>
        </div>
        {/* Valor Entrada - fundo secundário, número primário */}
        <div 
          className="rounded-lg p-2 flex items-center gap-2 border"
          style={{ 
            backgroundColor: `${systemConfig.cor_secundaria}25`,
            borderColor: `${systemConfig.cor_secundaria}40`
          }}
        >
          <span className="text-xl">💵</span>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Valor Entrada</p>
            <p className="text-lg font-bold leading-tight" style={{ color: systemConfig.cor_primaria }}>
              {formatCurrency(totais.valorEntrada)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-[1fr_240px] gap-3 min-h-0">
        {/* Left: Ranking Content */}
        <div className="bg-card/40 rounded-xl border border-border p-3 podium-glow flex flex-col overflow-hidden">
          <h2 className="text-center text-sm font-bold text-foreground mb-2 flex items-center justify-center gap-1">
            <span className="text-lg">🏆</span>
            Ranking de Vendas
          </h2>
          
          {/* Content based on whether there are squads */}
          <div className="flex-1 flex overflow-hidden">
            {hasSquads && viewMode === 'squads' ? (
              // Squad View - Each squad as a separate box with vendedores inside
              <div className={cn(
                "flex w-full h-full",
                squadData.length > 3 ? "gap-2" : "gap-3"
              )}>
                {squadData.map((squad, index) => (
                  <SquadSection 
                    key={squad.squad.id} 
                    data={squad} 
                    position={index + 1}
                    totalSquads={squadData.length}
                    primaryColor={systemConfig.cor_primaria}
                    secondaryColor={systemConfig.cor_secundaria}
                  />
                ))}
              </div>
            ) : (
              // Individual View - Centralized cards
              <div className="flex-1 flex items-center justify-center">
                <div className={cn(
                  "flex items-end justify-center flex-wrap",
                  sortedRanking.length > 6 ? "gap-2" : "gap-3"
                )}>
                  {sortedRanking.map((vendedor, index) => (
                    <PodiumCard 
                      key={vendedor.vendedor.id} 
                      data={vendedor} 
                      position={index + 1}
                      compact={sortedRanking.length > 5}
                      primaryColor={systemConfig.cor_primaria}
                      secondaryColor={systemConfig.cor_secundaria}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Team Stats + Metas */}
        <div className="bg-card/40 rounded-xl border border-border p-2 flex flex-col">
          <h3 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5 text-xs">
            <span>📊</span>
            Métricas & Metas
          </h3>
          <TeamStats totais={totais} meta={meta} primaryColor={systemConfig.cor_primaria} secondaryColor={systemConfig.cor_secundaria} />
        </div>
      </main>
    </div>
    </>
  );
};

export default Index;
