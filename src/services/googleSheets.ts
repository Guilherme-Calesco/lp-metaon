import { VendedorMetrics } from '@/types/dashboard';

function extractSpreadsheetId(url: string): string | null {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
    /key=([a-zA-Z0-9-_]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface VendedorInfo {
  nome: string;
  fotoUrl?: string;
  cargo?: string;
}

interface DailyEntry {
  data: string;
  vendedor: string;
  calls: number;
  leadsAtendidos: number;
  vendas: number;
  valorVenda: number;
  valorEntrada: number;
}

async function fetchCSV(spreadsheetId: string, sheetName: string): Promise<string> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(csvUrl);
  
  if (!response.ok) {
    throw new Error(`Erro ao acessar a aba "${sheetName}". Verifique se ela existe e está pública.`);
  }
  
  return response.text();
}

export async function fetchGoogleSheetsData(spreadsheetUrl: string): Promise<VendedorMetrics[]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  
  if (!spreadsheetId) {
    throw new Error('URL da planilha inválida');
  }

  // Fetch both sheets
  const [vendedoresCSV, dadosCSV] = await Promise.all([
    fetchCSV(spreadsheetId, 'vendedores'),
    fetchCSV(spreadsheetId, 'dados_diarios'),
  ]);

  const vendedoresInfo = parseVendedores(vendedoresCSV);
  const dailyEntries = parseDailyEntries(dadosCSV);
  
  return aggregateData(vendedoresInfo, dailyEntries);
}

function parseVendedores(csv: string): Map<string, VendedorInfo> {
  const lines = csv.split('\n').filter(line => line.trim());
  const vendedorMap = new Map<string, VendedorInfo>();
  
  if (lines.length < 2) return vendedorMap;

  // Skip header row
  const dataRows = lines.slice(1);
  
  for (const line of dataRows) {
    const values = parseCSVLine(line);
    // Columns: nome, foto_url, cargo
    const [nome, fotoUrl, cargo] = values;
    const cleanNome = cleanCSVValue(nome);
    
    if (cleanNome) {
      vendedorMap.set(cleanNome.toLowerCase(), {
        nome: cleanNome,
        fotoUrl: cleanCSVValue(fotoUrl) || undefined,
        cargo: cleanCSVValue(cargo) || 'Vendedor(a)',
      });
    }
  }
  
  return vendedorMap;
}

function parseDailyEntries(csv: string): DailyEntry[] {
  const lines = csv.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return [];

  // Skip header row
  const dataRows = lines.slice(1);
  
  return dataRows.map((line) => {
    const values = parseCSVLine(line);
    // Columns: data, vendedor, calls, leads_atendidos, vendas, valor_venda, valor_entrada
    const [data, vendedor, calls, leadsAtendidos, vendas, valorVenda, valorEntrada] = values;

    return {
      data: cleanCSVValue(data),
      vendedor: cleanCSVValue(vendedor),
      calls: parseInt(calls) || 0,
      leadsAtendidos: parseInt(leadsAtendidos) || 0,
      vendas: parseInt(vendas) || 0,
      valorVenda: parseFloat(valorVenda) || 0,
      valorEntrada: parseFloat(valorEntrada) || 0,
    };
  }).filter(entry => entry.vendedor);
}

function aggregateData(vendedoresInfo: Map<string, VendedorInfo>, entries: DailyEntry[]): VendedorMetrics[] {
  const aggregatedMap = new Map<string, {
    totalVendas: number;
    valorTotal: number;
    valorEntrada: number;
    totalCalls: number;
    totalLeads: number;
  }>();

  // Aggregate daily entries
  for (const entry of entries) {
    const key = entry.vendedor.toLowerCase();
    const existing = aggregatedMap.get(key) || {
      totalVendas: 0,
      valorTotal: 0,
      valorEntrada: 0,
      totalCalls: 0,
      totalLeads: 0,
    };

    existing.totalVendas += entry.vendas;
    existing.valorTotal += entry.valorVenda;
    existing.valorEntrada += entry.valorEntrada;
    existing.totalCalls += entry.calls;
    existing.totalLeads += entry.leadsAtendidos;

    aggregatedMap.set(key, existing);
  }

  // Build final result combining vendedor info with aggregated data
  const result: VendedorMetrics[] = [];
  let index = 0;

  for (const [key, data] of aggregatedMap) {
    const info = vendedoresInfo.get(key);
    
    result.push({
      vendedor: {
        id: `vendedor-${++index}`,
        nome: info?.nome || key,
        cargo: info?.cargo,
        fotoUrl: info?.fotoUrl,
      },
      totalVendas: data.totalVendas,
      valorTotal: data.valorTotal,
      valorEntrada: data.valorEntrada,
      totalCalls: data.totalCalls,
      totalLeads: data.totalLeads,
      vendasCall: 0,
      vendasWhatsapp: 0,
      taxaConversao: data.totalLeads > 0 ? (data.totalVendas / data.totalLeads) * 100 : 0,
      tendenciaVendas: [],
    });
  }

  return result;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  
  return values;
}

function cleanCSVValue(value: string): string {
  return value?.replace(/^"|"$/g, '').trim() || '';
}
