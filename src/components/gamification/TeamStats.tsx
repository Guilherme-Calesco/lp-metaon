import { Progress } from '@/components/ui/progress';
import { Meta } from '@/hooks/useMetas';

interface TotaisEquipe {
  totalCalls: number;
  totalLeads: number;
  totalVendas: number;
  valorTotal: number;
  valorEntrada: number;
  vendasCall: number;
  vendasWhatsapp: number;
}

interface StatItemProps {
  icon: string;
  label: string;
  value: string | number;
  highlight?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

function StatItem({ icon, label, value, highlight, primaryColor = '#22C55E', secondaryColor = '#3B82F6' }: StatItemProps) {
  return (
    <div 
      className="flex items-center gap-2 p-1.5 rounded-lg"
      style={{ 
        backgroundColor: highlight ? `${secondaryColor}25` : `${secondaryColor}15`,
        border: highlight ? `1px solid ${secondaryColor}40` : 'none'
      }}
    >
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">{label}</p>
        <p 
          className="text-xs font-bold"
          style={{ color: highlight ? primaryColor : 'hsl(var(--foreground))' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface GoalItemProps {
  icon: string;
  label: string;
  current: number;
  goal: number;
  isCurrency?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

function formatValue(value: number, isCurrency: boolean): string {
  if (isCurrency) {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value.toFixed(0)}`;
  }
  return value.toString();
}

function GoalItem({ icon, label, current, goal, isCurrency = false, primaryColor = '#22C55E', secondaryColor = '#3B82F6' }: GoalItemProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isComplete = current >= goal && goal > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs">{icon}</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        <span 
          className="text-[10px] font-bold"
          style={{ color: isComplete ? primaryColor : 'hsl(var(--foreground))' }}
        >
          {formatValue(current, isCurrency)} / {formatValue(goal, isCurrency)}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorColor={primaryColor}
        trackColor={`${secondaryColor}40`}
      />
      <p 
        className="text-[9px] text-right"
        style={{ 
          color: isComplete ? primaryColor : 'hsl(var(--muted-foreground))',
          fontWeight: isComplete ? 'bold' : 'normal'
        }}
      >
        {percentage.toFixed(0)}% {isComplete && '✓'}
      </p>
    </div>
  );
}

interface TeamStatsProps {
  totais: TotaisEquipe;
  meta?: Meta | null;
  primaryColor?: string;
  secondaryColor?: string;
}

export function TeamStats({ totais, meta, primaryColor = '#22C55E', secondaryColor = '#3B82F6' }: TeamStatsProps) {
  // Conv. Geral = (vendas_calls + vendas_leads) / (calls + leads)
  const totalContatos = totais.totalCalls + totais.totalLeads;
  const totalVendasConversao = totais.vendasCall + totais.vendasWhatsapp;
  const taxaConversaoGeral = totalContatos > 0 
    ? (totalVendasConversao / totalContatos) * 100 
    : 0;
  
  // Conv. Calls = vendas_calls / calls
  const taxaConversaoCalls = totais.totalCalls > 0 
    ? (totais.vendasCall / totais.totalCalls) * 100 
    : 0;
  
  // Conv. Leads = vendas_leads / leads_atendidos
  const taxaConversaoLeads = totais.totalLeads > 0 
    ? (totais.vendasWhatsapp / totais.totalLeads) * 100 
    : 0;

  const hasMetas = meta && (
    meta.valor_entrada_meta > 0 ||
    meta.valor_vendas_meta > 0 ||
    meta.vendas_meta > 0 ||
    meta.calls_meta > 0 ||
    meta.leads_meta > 0
  );

  return (
    <div className="space-y-2 flex-1 flex flex-col">
      {/* Métricas em lista */}
      <div className="space-y-1.5">
        <StatItem icon="☎️" label="Calls" value={totais.totalCalls} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        <StatItem icon="💬" label="Leads" value={totais.totalLeads} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        <StatItem icon="🎯" label="Conv. Geral" value={`${taxaConversaoGeral.toFixed(1)}%`} highlight primaryColor={primaryColor} secondaryColor={secondaryColor} />
        <StatItem icon="📞" label="Conv. Calls" value={`${taxaConversaoCalls.toFixed(1)}%`} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        <StatItem icon="👥" label="Conv. Leads" value={`${taxaConversaoLeads.toFixed(1)}%`} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </div>

      {/* Metas */}
      {hasMetas && (
        <>
          <div className="h-px bg-border my-1" />
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            🎯 Metas do Mês
          </h4>
          <div className="space-y-2 flex-1">
            {meta.valor_entrada_meta > 0 && (
              <GoalItem
                icon="💰"
                label="Entrada"
                current={totais.valorEntrada}
                goal={meta.valor_entrada_meta}
                isCurrency
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
            {meta.valor_vendas_meta > 0 && (
              <GoalItem
                icon="💵"
                label="Vendas R$"
                current={totais.valorTotal}
                goal={meta.valor_vendas_meta}
                isCurrency
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
            {meta.vendas_meta > 0 && (
              <GoalItem
                icon="📈"
                label="Vendas"
                current={totais.totalVendas}
                goal={meta.vendas_meta}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
            {meta.calls_meta > 0 && (
              <GoalItem
                icon="☎️"
                label="Calls"
                current={totais.totalCalls}
                goal={meta.calls_meta}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
            {meta.leads_meta > 0 && (
              <GoalItem
                icon="💬"
                label="Leads"
                current={totais.totalLeads}
                goal={meta.leads_meta}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
          </div>
        </>
      )}

      {!hasMetas && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground text-center">
            Nenhuma meta definida.<br/>
            Configure em Controle → Metas.
          </p>
        </div>
      )}
    </div>
  );
}
