import { Vendedor, VendedorMetrics } from '@/types/dashboard';

// ========================================
// FORMATO DA PLANILHA GOOGLE SHEETS
// ========================================
// Aba: "ranking_vendas"
// 
// Colunas obrigatórias:
// A: nome_vendedor (texto)
// B: foto_url (link da imagem)
// C: cargo (texto)
// D: vendas_total (número inteiro)
// E: valor_total (número decimal - R$)
// F: valor_entrada (número decimal - R$)
// G: leads_atendidos (número inteiro)
// H: calls_realizadas (número inteiro)
// I: vendas_call (número inteiro)
// J: vendas_whatsapp (número inteiro)
// ========================================

export const vendedores: Vendedor[] = [
  { id: '1', nome: 'Ana Silva', cargo: 'Vendedora Sênior', fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
  { id: '2', nome: 'Carlos Santos', cargo: 'Vendedor', fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: '3', nome: 'Maria Oliveira', cargo: 'Vendedora', fotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: '4', nome: 'Pedro Costa', cargo: 'Vendedor Júnior', fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
];

// Dados mockados para demonstração - serão substituídos pela planilha
export const vendedoresRanking: VendedorMetrics[] = [
  {
    vendedor: vendedores[0], // Ana - 1º lugar
    totalVendas: 28,
    valorTotal: 156800,
    valorEntrada: 142500,
    totalCalls: 145,
    totalLeads: 98,
    vendasCall: 16,
    vendasWhatsapp: 12,
    taxaConversao: 28.57,
    tendenciaVendas: [5, 7, 6, 8, 9, 10, 8, 9, 11, 10],
  },
  {
    vendedor: vendedores[1], // Carlos - 2º lugar
    totalVendas: 24,
    valorTotal: 132400,
    valorEntrada: 118200,
    totalCalls: 128,
    totalLeads: 92,
    vendasCall: 14,
    vendasWhatsapp: 10,
    taxaConversao: 26.09,
    tendenciaVendas: [4, 6, 5, 7, 8, 7, 9, 8, 9, 8],
  },
  {
    vendedor: vendedores[2], // Maria - 3º lugar
    totalVendas: 21,
    valorTotal: 118500,
    valorEntrada: 105300,
    totalCalls: 115,
    totalLeads: 85,
    vendasCall: 12,
    vendasWhatsapp: 9,
    taxaConversao: 24.71,
    tendenciaVendas: [3, 5, 4, 6, 7, 6, 8, 7, 8, 7],
  },
  {
    vendedor: vendedores[3], // Pedro - 4º lugar
    totalVendas: 14,
    valorTotal: 72600,
    valorEntrada: 65800,
    totalCalls: 88,
    totalLeads: 65,
    vendasCall: 7,
    vendasWhatsapp: 7,
    taxaConversao: 21.54,
    tendenciaVendas: [1, 3, 2, 4, 5, 4, 5, 5, 6, 5],
  },
];

export function calcularTotaisEquipe() {
  const totalVendas = vendedoresRanking.reduce((acc, v) => acc + v.totalVendas, 0);
  const valorTotal = vendedoresRanking.reduce((acc, v) => acc + v.valorTotal, 0);
  const valorEntrada = vendedoresRanking.reduce((acc, v) => acc + v.valorEntrada, 0);
  const totalCalls = vendedoresRanking.reduce((acc, v) => acc + v.totalCalls, 0);
  const totalLeads = vendedoresRanking.reduce((acc, v) => acc + v.totalLeads, 0);
  const vendasCall = vendedoresRanking.reduce((acc, v) => acc + v.vendasCall, 0);
  const vendasWhatsapp = vendedoresRanking.reduce((acc, v) => acc + v.vendasWhatsapp, 0);
  
  const taxaConversaoGeral = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0;
  const taxaConversaoCalls = totalCalls > 0 ? (vendasCall / totalCalls) * 100 : 0;
  const taxaConversaoLeads = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0;
  
  return {
    totalVendas,
    valorTotal,
    valorEntrada,
    totalCalls,
    totalLeads,
    taxaConversaoGeral,
    taxaConversaoCalls,
    taxaConversaoLeads,
  };
}
