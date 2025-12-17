import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const SPREADSHEET_FORMAT = `FORMATO DA PLANILHA GOOGLE SHEETS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABA 1: vendedores
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A | nome      | Texto | Nome do vendedor
B | foto_url  | Link  | URL da foto
C | cargo     | Texto | Cargo (Closer, Vendedor, etc)

Exemplo:
Ana Silva | https://foto... | Closer
Carlos Santos | https://foto... | Vendedor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABA 2: dados_diarios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A | data            | Data   | Data do registro
B | vendedor        | Texto  | Nome do vendedor
C | calls           | Número | Calls feitas
D | leads_atendidos | Número | Leads atendidos
E | vendas          | Número | Vendas feitas
F | valor_venda     | Número | Valor das vendas
G | valor_entrada   | Número | Valor de entrada

Exemplo:
10/12/2024 | Ana Silva | 15 | 8 | 2 | 12000 | 6000
10/12/2024 | Carlos Santos | 12 | 6 | 1 | 5500 | 2500

O dashboard soma automaticamente os dados de cada vendedor!`;

export function SpreadsheetConfig() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyFormat = () => {
    navigator.clipboard.writeText(SPREADSHEET_FORMAT);
    setCopied(true);
    toast.success('Formato copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (spreadsheetUrl) {
      localStorage.setItem('nexttrack_spreadsheet_url', spreadsheetUrl);
      toast.success('URL da planilha salva! Atualizando dados...');
      // Dispatch custom event to trigger refresh
      window.dispatchEvent(new Event('spreadsheet-url-changed'));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 z-50 bg-card/90 backdrop-blur border-border hover:bg-accent"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileSpreadsheet className="h-5 w-5 text-nexttrack-green" />
            Configurar Planilha
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              URL da Planilha Google Sheets
            </label>
            <div className="flex gap-2">
              <Input
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 bg-muted border-border text-foreground"
              />
              <Button onClick={handleSave} className="bg-nexttrack-green hover:bg-nexttrack-green/90">
                Salvar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole o link da sua planilha pública do Google Sheets
            </p>
          </div>

          {/* Format Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Formato da Planilha
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyFormat}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-1 text-nexttrack-green" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <pre className="bg-muted rounded-lg p-4 text-xs text-muted-foreground overflow-auto max-h-[300px] whitespace-pre-wrap">
              {SPREADSHEET_FORMAT}
            </pre>
          </div>

          {/* Auto-refresh info */}
          <div className="bg-nexttrack-green/10 rounded-lg p-4 border border-nexttrack-green/30">
            <p className="text-sm text-foreground flex items-start gap-2">
              <span className="text-lg">🔄</span>
              <span>
                <strong>Atualização automática:</strong> O dashboard irá atualizar os dados 
                automaticamente a cada 30 segundos quando conectado à planilha.
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
