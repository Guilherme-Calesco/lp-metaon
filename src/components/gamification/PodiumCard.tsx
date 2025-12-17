import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VendedorMetrics } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PodiumCardProps {
  data: VendedorMetrics;
  position: number;
  compact?: boolean;
  squadColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getPositionStyles(position: number, compact: boolean) {
  if (compact) {
    switch (position) {
      case 1:
        return {
          ring: 'ring-2 ring-yellow-400',
          badge: '🥇',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
          avatarSize: 'h-10 w-10',
          scale: 'scale-105',
        };
      case 2:
        return {
          ring: 'ring-2 ring-gray-300',
          badge: '🥈',
          glow: 'shadow-[0_0_15px_rgba(156,163,175,0.2)]',
          avatarSize: 'h-9 w-9',
          scale: '',
        };
      case 3:
        return {
          ring: 'ring-2 ring-amber-600',
          badge: '🥉',
          glow: 'shadow-[0_0_15px_rgba(180,83,9,0.2)]',
          avatarSize: 'h-8 w-8',
          scale: '',
        };
      default:
        return {
          ring: 'ring-1 ring-border',
          badge: `${position}º`,
          glow: '',
          avatarSize: 'h-7 w-7',
          scale: '',
        };
    }
  }

  switch (position) {
    case 1:
      return {
        ring: 'ring-4 ring-yellow-400',
        badge: '🥇',
        glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
        avatarSize: 'h-16 w-16',
        scale: 'scale-110',
      };
    case 2:
      return {
        ring: 'ring-4 ring-gray-300',
        badge: '🥈',
        glow: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
        avatarSize: 'h-14 w-14',
        scale: '',
      };
    case 3:
      return {
        ring: 'ring-4 ring-amber-600',
        badge: '🥉',
        glow: 'shadow-[0_0_20px_rgba(180,83,9,0.3)]',
        avatarSize: 'h-12 w-12',
        scale: '',
      };
    default:
      return {
        ring: 'ring-2 ring-border',
        badge: `${position}º`,
        glow: '',
        avatarSize: 'h-10 w-10',
        scale: '',
      };
  }
}

export function PodiumCard({ data, position, compact = false, squadColor, primaryColor = '#22C55E', secondaryColor = '#3B82F6' }: PodiumCardProps) {
  const styles = getPositionStyles(position, compact);
  const isTop3 = position <= 3;

  // Taxas de conversão individuais
  // Conv. Calls = vendas_calls / calls
  const taxaConversaoCalls = data.totalCalls > 0 ? (data.vendasCall / data.totalCalls) * 100 : 0;
  // Conv. Leads = vendas_leads / leads_atendidos
  const taxaConversaoLeads = data.totalLeads > 0 ? (data.vendasWhatsapp / data.totalLeads) * 100 : 0;

  // Trend indicator
  const getTrendIndicator = () => {
    if (data.posicaoAnterior === undefined) return null;
    
    const diff = data.posicaoAnterior - position;
    if (diff > 0) {
      return { icon: TrendingUp, color: 'text-green-500', label: `+${diff}` };
    } else if (diff < 0) {
      return { icon: TrendingDown, color: 'text-red-500', label: `${diff}` };
    }
    return { icon: Minus, color: 'text-muted-foreground', label: '=' };
  };

  const trend = getTrendIndicator();

  return (
    <div
      className={cn(
        "flex flex-col items-center transition-all duration-500",
        styles.scale
      )}
    >
      {/* Badge + Trend */}
      <div className="mb-2 flex items-center gap-1">
        <div className={cn(
          "flex items-center justify-center",
          isTop3 ? "text-2xl" : "text-sm font-bold text-muted-foreground bg-card/80 rounded-full w-6 h-6"
        )}>
          {styles.badge}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-0.5", trend.color)}>
            <trend.icon className="h-3 w-3" />
          </div>
        )}
      </div>
      
      {/* Podium Block */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-start rounded-xl",
          "bg-gradient-to-b from-card to-card/80",
          squadColor ? "border-2" : "border border-border/50",
          styles.glow,
          compact 
            ? "pt-2 px-2 pb-1.5 min-w-[95px]" 
            : isTop3 ? "pt-3 px-3 pb-2 min-w-[130px]" : "pt-3 px-3 pb-2 min-w-[110px]"
        )}
        style={squadColor ? { borderColor: `${squadColor}60` } : undefined}
      >
        {/* Avatar */}
        <Avatar className={cn(styles.avatarSize, styles.ring, compact ? "mb-1" : "mb-2")}>
          <AvatarImage src={data.vendedor.fotoUrl} alt={data.vendedor.nome} />
          <AvatarFallback 
            className={cn(
              "text-white font-bold",
              compact ? "text-[8px]" : "text-xs"
            )}
            style={{ backgroundColor: primaryColor }}
          >
            {data.vendedor.nome.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        {/* Name */}
        <p className={cn(
          "font-semibold text-foreground text-center leading-tight",
          compact ? "text-[9px]" : isTop3 ? "text-xs" : "text-[10px]"
        )}>
          {data.vendedor.nome.split(' ')[0]}
        </p>
        
        {/* Main Stats */}
        <div className={cn("text-center w-full", compact ? "mt-0.5" : "mt-1")}>
          <p 
            className={cn("font-bold", compact ? "text-sm" : isTop3 ? "text-lg" : "text-base")}
            style={{ color: primaryColor }}
          >
            {data.totalVendas}
          </p>
          <p className={cn(
            "text-muted-foreground uppercase tracking-wide",
            compact ? "text-[6px] mb-1" : "text-[8px] mb-2"
          )}>vendas</p>
          
          {/* Valor de Venda - Fundo secundário, texto branco */}
          <div 
            className={cn("rounded-lg border", compact ? "py-1 px-1.5 mb-1" : "py-1.5 px-2 mb-1.5")}
            style={{ 
              backgroundColor: `${secondaryColor}25`,
              borderColor: `${secondaryColor}40`
            }}
          >
            <p className={cn("text-muted-foreground uppercase tracking-wide", compact ? "text-[6px]" : "text-[8px]")}>📈 Venda</p>
            <p 
              className={cn("font-bold text-white", compact ? "text-[10px]" : isTop3 ? "text-base" : "text-sm")}
            >
              {formatCurrency(data.valorTotal)}
            </p>
          </div>
          
          {/* Valor de Entrada - Fundo secundário, texto primário */}
          <div 
            className={cn("rounded-lg border", compact ? "py-1 px-1.5" : "py-1.5 px-2")}
            style={{ 
              backgroundColor: `${secondaryColor}25`,
              borderColor: `${secondaryColor}40`
            }}
          >
            <p className={cn("text-muted-foreground uppercase tracking-wide", compact ? "text-[6px]" : "text-[8px]")}>💰 Entrada</p>
            <p 
              className={cn("font-bold", compact ? "text-[10px]" : isTop3 ? "text-base" : "text-sm")}
              style={{ color: primaryColor }}
            >
              {formatCurrency(data.valorEntrada)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className={cn("w-full h-px bg-border", compact ? "my-1" : "my-1.5")} />

        {/* Individual Metrics */}
        <div className={cn("w-full space-y-0.5", compact ? "text-[7px]" : "text-[9px]")}>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Leads:</span>
            <span className="font-medium text-foreground">{data.totalLeads}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Calls:</span>
            <span className="font-medium text-foreground">{data.totalCalls}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conv. Leads:</span>
            <span className="font-medium" style={{ color: primaryColor }}>{taxaConversaoLeads.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conv. Calls:</span>
            <span className="font-medium" style={{ color: primaryColor }}>{taxaConversaoCalls.toFixed(1)}%</span>
          </div>
        </div>

        {/* Payment Method Stats */}
        {data.paymentMethodStats && data.paymentMethodStats.length > 0 && (
          <>
            <div className={cn("w-full h-px bg-border", compact ? "my-1" : "my-1.5")} />
            <div className={cn("w-full", compact ? "text-[6px]" : "text-[8px]")}>
              <p className="text-muted-foreground mb-0.5 uppercase tracking-wide">Pagamentos</p>
              <div className="flex flex-wrap gap-0.5">
                {data.paymentMethodStats.slice(0, 3).map((stat) => (
                  <span 
                    key={stat.metodo} 
                    className="px-1 py-0.5 bg-muted/50 rounded text-foreground"
                  >
                    {stat.label.split(' ')[0]} <span className="font-bold" style={{ color: primaryColor }}>{stat.percentage}%</span>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
