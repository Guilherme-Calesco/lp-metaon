import { SquadMetrics } from '@/types/dashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SquadCardProps {
  data: SquadMetrics;
  position: number;
  totalSquads: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
}

function VendedorMiniCard({ 
  vendedor, 
  position, 
  squadColor,
  compact 
}: { 
  vendedor: any; 
  position: number; 
  squadColor: string;
  compact: boolean;
}) {
  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return null;
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center rounded-lg border bg-card/60 backdrop-blur-sm transition-all hover:scale-105",
        compact ? "p-1.5 min-w-[70px]" : "p-2 min-w-[90px]"
      )}
      style={{ borderColor: `${squadColor}50` }}
    >
      {/* Position Badge */}
      <div 
        className={cn(
          "absolute -top-2 -left-2 rounded-full flex items-center justify-center font-bold text-white",
          compact ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[9px]"
        )}
        style={{ backgroundColor: squadColor }}
      >
        {position}
      </div>

      {/* Medal for top 3 */}
      {getMedalEmoji(position) && (
        <span className={cn("absolute -top-1 -right-1", compact ? "text-xs" : "text-sm")}>
          {getMedalEmoji(position)}
        </span>
      )}

      {/* Avatar */}
      <Avatar 
        className={cn("border-2 mb-1", compact ? "h-8 w-8" : "h-10 w-10")} 
        style={{ borderColor: squadColor }}
      >
        <AvatarImage src={vendedor.vendedor.fotoUrl} alt={vendedor.vendedor.nome} />
        <AvatarFallback className={cn("font-bold", compact ? "text-[8px]" : "text-[10px]")}>
          {vendedor.vendedor.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <p className={cn(
        "font-medium text-center truncate w-full",
        compact ? "text-[8px]" : "text-[10px]"
      )}>
        {vendedor.vendedor.nome.split(' ')[0]}
      </p>

      {/* Value */}
      <p className={cn(
        "font-bold text-nexttrack-green",
        compact ? "text-[9px]" : "text-xs"
      )}>
        {formatCurrency(vendedor.valorEntrada)}
      </p>

      {/* Sales count */}
      <p className="text-[7px] text-muted-foreground">
        {vendedor.totalVendas} vendas
      </p>
    </div>
  );
}

export function SquadCard({ data, position, totalSquads }: SquadCardProps) {
  const { squad, vendedores, valorEntrada, valorTotal, totalVendas, taxaConversao } = data;

  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const isCompact = totalSquads > 2 || vendedores.length > 4;
  const sortedVendedores = [...vendedores].sort((a, b) => b.valorEntrada - a.valorEntrada);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 bg-card/80 backdrop-blur-sm h-full",
        isCompact ? "p-2" : "p-3",
        totalSquads === 1 ? "flex-1 max-w-3xl" : "flex-1"
      )}
      style={{ 
        borderColor: squad.cor,
        boxShadow: `0 4px 30px ${squad.cor}40`
      }}
    >
      {/* Header with medal and squad name */}
      <div 
        className="flex items-center justify-between mb-2 pb-2 border-b" 
        style={{ borderColor: `${squad.cor}40` }}
      >
        <div className="flex items-center gap-2">
          <span className={isCompact ? "text-xl" : "text-2xl"}>{getMedalEmoji(position)}</span>
          <h3 
            className={cn("font-bold", isCompact ? "text-base" : "text-xl")}
            style={{ color: squad.cor }}
          >
            {squad.nome}
          </h3>
        </div>
      </div>

      {/* Squad Totals - Prominent Display */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div 
          className="text-center p-2 rounded-lg" 
          style={{ backgroundColor: `${squad.cor}15` }}
        >
          <p className="text-[8px] text-muted-foreground uppercase tracking-wide">💵 Entrada</p>
          <p className={cn("font-bold text-nexttrack-green", isCompact ? "text-base" : "text-xl")}>
            {formatCurrency(valorEntrada)}
          </p>
        </div>
        <div 
          className="text-center p-2 rounded-lg" 
          style={{ backgroundColor: `${squad.cor}15` }}
        >
          <p className="text-[8px] text-muted-foreground uppercase tracking-wide">💰 Vendas</p>
          <p className={cn("font-bold text-nexttrack-green", isCompact ? "text-base" : "text-xl")}>
            {formatCurrency(valorTotal)}
          </p>
        </div>
        <div 
          className="text-center p-2 rounded-lg" 
          style={{ backgroundColor: `${squad.cor}15` }}
        >
          <p className="text-[8px] text-muted-foreground uppercase tracking-wide">📊 Métricas</p>
          <p className={cn("font-bold", isCompact ? "text-sm" : "text-base")}>
            {totalVendas} <span className="text-muted-foreground text-[8px]">vendas</span>
          </p>
          <p className="text-[9px] text-muted-foreground">
            {taxaConversao.toFixed(1)}% conv.
          </p>
        </div>
      </div>

      {/* Team Members - Cards Grid */}
      <div className="flex-1">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-2 text-center">
          👥 Equipe ({vendedores.length} {vendedores.length === 1 ? 'membro' : 'membros'})
        </p>
        <div className={cn(
          "flex flex-wrap justify-center gap-2",
          sortedVendedores.length > 6 ? "gap-1" : "gap-2"
        )}>
          {sortedVendedores.map((v, idx) => (
            <VendedorMiniCard 
              key={v.vendedor.id} 
              vendedor={v} 
              position={idx + 1}
              squadColor={squad.cor}
              compact={isCompact || sortedVendedores.length > 5}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
