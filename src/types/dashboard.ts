export interface Squad {
  id: string;
  nome: string;
  cor: string;
  fotoUrl?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  fotoUrl?: string;
  cargo?: string;
  squadId?: string;
}

export interface PaymentMethodStat {
  metodo: string;
  label: string;
  count: number;
  percentage: string;
}

export interface VendedorMetrics {
  vendedor: Vendedor;
  totalVendas: number;
  valorTotal: number;
  valorEntrada: number;
  totalCalls: number;
  totalLeads: number;
  vendasCall: number;
  vendasWhatsapp: number;
  taxaConversao: number;
  tendenciaVendas: number[];
  posicaoAnterior?: number;
  paymentMethodStats?: PaymentMethodStat[];
}

export interface SquadMetrics {
  squad: Squad;
  vendedores: VendedorMetrics[];
  totalVendas: number;
  valorTotal: number;
  valorEntrada: number;
  totalCalls: number;
  totalLeads: number;
  taxaConversao: number;
}
