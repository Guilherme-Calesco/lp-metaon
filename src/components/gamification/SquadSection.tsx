import { SquadMetrics } from '@/types/dashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SquadSectionProps {
  data: SquadMetrics;
  position: number;
  totalSquads: number;
  primaryColor?: string;
  secondaryColor?: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
}

export function SquadSection({ data, position, totalSquads, primaryColor = '#22C55E', secondaryColor = '#3B82F6' }: SquadSectionProps) {
  const { squad, vendedores, valorEntrada, valorTotal, totalVendas, taxaConversao } = data;

  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const isCompact = totalSquads > 2;
  const sortedVendedores = [...vendedores].sort((a, b) => b.valorEntrada - a.valorEntrada);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border-2 bg-card/60 backdrop-blur-sm flex-1 min-w-0",
        isCompact ? "p-2" : "p-3"
      )}
      style={{ 
        borderColor: squad.cor,
        boxShadow: `0 4px 30px ${squad.cor}30`
      }}
    >
      {/* Squad Header - Name and Photo on top */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className={isCompact ? "text-lg" : "text-xl"}>{getMedalEmoji(position)}</span>
        <Avatar 
          className={cn(
            "border-2",
            isCompact ? "h-8 w-8" : "h-10 w-10"
          )} 
          style={{ borderColor: squad.cor }}
        >
          <AvatarImage src={squad.fotoUrl} alt={squad.nome} />
          <AvatarFallback 
            className="font-bold text-white text-xs"
            style={{ backgroundColor: squad.cor }}
          >
            {squad.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 
          className={cn("font-bold", isCompact ? "text-sm" : "text-base")}
          style={{ color: squad.cor }}
        >
          {squad.nome}
        </h3>
      </div>

      {/* Squad Totals - Below header */}
      <div 
        className="flex items-center justify-center gap-2 pb-2 mb-2 border-b"
        style={{ borderColor: `${squad.cor}40` }}
      >
        <div className="text-center px-2 py-1 rounded-lg" style={{ backgroundColor: `${secondaryColor}25` }}>
          <p className="text-[7px] text-muted-foreground uppercase">💵 Entrada</p>
          <p className={cn("font-bold", isCompact ? "text-xs" : "text-sm")} style={{ color: primaryColor }}>
            {formatCurrency(valorEntrada)}
          </p>
        </div>
        <div className="text-center px-2 py-1 rounded-lg" style={{ backgroundColor: `${secondaryColor}25` }}>
          <p className="text-[7px] text-muted-foreground uppercase">💰 Vendas</p>
          <p className={cn("font-bold text-white", isCompact ? "text-xs" : "text-sm")}>
            {formatCurrency(valorTotal)}
          </p>
        </div>
        <div className="text-center px-2 py-1 rounded-lg" style={{ backgroundColor: `${secondaryColor}25` }}>
          <p className="text-[7px] text-muted-foreground uppercase">📊 Qtd</p>
          <p className={cn("font-bold text-white", isCompact ? "text-xs" : "text-sm")}>
            {totalVendas}
          </p>
        </div>
        <div className="text-center px-2 py-1 rounded-lg" style={{ backgroundColor: `${secondaryColor}25` }}>
          <p className="text-[7px] text-muted-foreground uppercase">📈 Conv.</p>
          <p className={cn("font-bold", isCompact ? "text-xs" : "text-sm")} style={{ color: primaryColor }}>
            {taxaConversao.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Vendedores List */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {sortedVendedores.map((vendedor, idx) => {
          const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
          return (
            <div 
              key={vendedor.vendedor.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-lg",
                idx === 0 && "bg-yellow-500/10 border border-yellow-500/30",
                idx === 1 && "bg-gray-400/10 border border-gray-400/30",
                idx === 2 && "bg-amber-600/10 border border-amber-600/30",
                idx > 2 && "bg-muted/30"
              )}
            >
              <span className="text-xs min-w-[20px]">{medalEmoji}</span>
              <Avatar className="h-6 w-6 border" style={{ borderColor: squad.cor }}>
                <AvatarImage src={vendedor.vendedor.fotoUrl} alt={vendedor.vendedor.nome} />
                <AvatarFallback className="text-[8px] font-bold" style={{ backgroundColor: squad.cor, color: 'white' }}>
                  {vendedor.vendedor.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-xs flex-1 truncate">{vendedor.vendedor.nome}</span>
              <div className="flex items-center gap-1 text-[9px]">
                <div className="text-center">
                  <span className="text-muted-foreground block text-[7px]">Entrada</span>
                  <span className="font-bold" style={{ color: primaryColor }}>{formatCurrency(vendedor.valorEntrada)}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block text-[7px]">Venda</span>
                  <span className="font-bold text-white">{formatCurrency(vendedor.valorTotal)}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block text-[7px]">Qtd</span>
                  <span className="font-medium">{vendedor.totalVendas}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
