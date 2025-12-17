import { useState, useEffect, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Plus, User, BarChart3, ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2, X, Check, LogOut, Target, Users, ShoppingCart, Palette, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { useVendasIndividuais, METODOS_PAGAMENTO } from '@/hooks/useVendasIndividuais';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { SpreadsheetInput } from '@/components/gamification/SpreadsheetInput';
import { useAuth } from '@/hooks/useAuth';
import { useMetas } from '@/hooks/useMetas';
import { useSquads } from '@/hooks/useSquads';
import { useSystemConfigContext } from '@/contexts/SystemConfigContext';
import { useAccount } from '@/hooks/useAccount';

interface Vendedor {
  id: string;
  nome: string;
  foto_url: string | null;
  cargo: string | null;
  squad_id: string | null;
}

interface DadoDiario {
  id: string;
  vendedor_id: string;
  data: string;
  calls: number;
  leads_atendidos: number;
  vendas: number;
  vendas_calls: number;
  vendas_leads: number;
  valor_venda: number;
  valor_entrada: number;
}

const SQUAD_COLORS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Amarelo' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Ciano' },
  { value: '#F97316', label: 'Laranja' },
];

const Admin = forwardRef<HTMLDivElement>(function Admin(_, ref) {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [monthData, setMonthData] = useState<Map<string, DadoDiario>>(new Map());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { meta, saveMeta } = useMetas(currentMonth);
  const { squads, addSquad, updateSquad, deleteSquad, assignVendedorToSquad, refresh: refreshSquads } = useSquads();
  const { config: systemConfig, updateConfig: updateSystemConfig } = useSystemConfigContext();
  const { 
    customer, 
    paymentMethods, 
    subscription, 
    plan, 
    isLoading: isLoadingAccount,
    cancelSubscription,
    deleteAccount,
    resetData,
    removePaymentMethod,
    setDefaultPaymentMethod
  } = useAccount();
  const [vendaVendedorId, setVendaVendedorId] = useState<string>('');
  const { vendas: vendasIndividuais, addVenda, deleteVenda, isLoading: isLoadingVendas } = useVendasIndividuais(vendaVendedorId || undefined, currentMonth);
  const { vendas: todasVendas } = useVendasIndividuais(undefined, currentMonth);
  const [vendasListPage, setVendasListPage] = useState(1);
  const vendasListPerPage = 100;

  // System config form state
  const [configNome, setConfigNome] = useState('');
  const [configCorPrimaria, setConfigCorPrimaria] = useState('#22C55E');
  const [configCorSecundaria, setConfigCorSecundaria] = useState('#3B82F6');
  const [configLogo, setConfigLogo] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Sync config form with loaded config
  useEffect(() => {
    if (systemConfig) {
      setConfigNome(systemConfig.nome_sistema || '');
      setConfigCorPrimaria(systemConfig.cor_primaria || '#22C55E');
      setConfigCorSecundaria(systemConfig.cor_secundaria || '#3B82F6');
      setConfigLogo(systemConfig.logo_url || '');
    }
  }, [systemConfig]);

  // Metas form state
  const [metaValorEntrada, setMetaValorEntrada] = useState('');
  const [metaValorVendas, setMetaValorVendas] = useState('');
  const [metaVendas, setMetaVendas] = useState('');
  const [metaCalls, setMetaCalls] = useState('');
  const [metaLeads, setMetaLeads] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // Squad form state
  const [novoSquadNome, setNovoSquadNome] = useState('');
  const [novoSquadCor, setNovoSquadCor] = useState('#3B82F6');
  const [novoSquadFoto, setNovoSquadFoto] = useState('');
  const [editingSquad, setEditingSquad] = useState<string | null>(null);
  const [editSquadNome, setEditSquadNome] = useState('');
  const [editSquadCor, setEditSquadCor] = useState('');
  const [editSquadFoto, setEditSquadFoto] = useState('');

  // Individual sale form state
  const [novaVendaValor, setNovaVendaValor] = useState('');
  const [novaVendaEntrada, setNovaVendaEntrada] = useState('');
  const [novaVendaMetodos, setNovaVendaMetodos] = useState<string[]>(['pix']);
  const [novaVendaData, setNovaVendaData] = useState(new Date().toISOString().split('T')[0]);
  const [novaVendaTipo, setNovaVendaTipo] = useState<'call' | 'lead'>('lead');
  const [vendasPage, setVendasPage] = useState(1);
  const vendasPerPage = 50;

  // Edit venda individual state
  const [editingVenda, setEditingVenda] = useState<string | null>(null);
  const [editVendaVendedorId, setEditVendaVendedorId] = useState('');
  const [editVendaData, setEditVendaData] = useState('');
  const [editVendaValor, setEditVendaValor] = useState('');
  const [editVendaEntrada, setEditVendaEntrada] = useState('');
  const [editVendaTipo, setEditVendaTipo] = useState<'call' | 'lead'>('lead');
  const [editVendaMetodos, setEditVendaMetodos] = useState<string[]>([]);

  // Sync meta form with loaded meta
  useEffect(() => {
    if (meta) {
      setMetaValorEntrada(meta.valor_entrada_meta > 0 ? meta.valor_entrada_meta.toString() : '');
      setMetaValorVendas(meta.valor_vendas_meta > 0 ? meta.valor_vendas_meta.toString() : '');
      setMetaVendas(meta.vendas_meta > 0 ? meta.vendas_meta.toString() : '');
      setMetaCalls(meta.calls_meta > 0 ? meta.calls_meta.toString() : '');
      setMetaLeads(meta.leads_meta > 0 ? meta.leads_meta.toString() : '');
    } else {
      setMetaValorEntrada('');
      setMetaValorVendas('');
      setMetaVendas('');
      setMetaCalls('');
      setMetaLeads('');
    }
  }, [meta]);

  async function handleSaveMeta() {
    setIsSavingMeta(true);
    try {
      const mesStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`;
      await saveMeta({
        mes: mesStr,
        valor_entrada_meta: parseFloat(metaValorEntrada) || 0,
        valor_vendas_meta: parseFloat(metaValorVendas) || 0,
        vendas_meta: parseInt(metaVendas) || 0,
        calls_meta: parseInt(metaCalls) || 0,
        leads_meta: parseInt(metaLeads) || 0,
      });
      toast.success('Metas salvas com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar metas');
    }
    setIsSavingMeta(false);
  }

  async function handleSaveConfig() {
    setIsSavingConfig(true);
    try {
      await updateSystemConfig({
        nome_sistema: configNome,
        cor_primaria: configCorPrimaria,
        cor_secundaria: configCorSecundaria,
        logo_url: configLogo || null,
      });
    } catch (error) {
      console.error(error);
    }
    setIsSavingConfig(false);
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  // Form states for new vendedor
  const [novoNome, setNovoNome] = useState('');
  const [novoFotoUrl, setNovoFotoUrl] = useState('');
  const [novoCargo, setNovoCargo] = useState('Vendedor(a)');
  const [novoSquadId, setNovoSquadId] = useState<string>('');

  // Edit vendedor states
  const [editingVendedor, setEditingVendedor] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editSquadId, setEditSquadId] = useState<string>('');

  // Get days in current month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    fetchVendedores();
  }, []);

  useEffect(() => {
    if (selectedVendedor) {
      fetchMonthData(selectedVendedor.id);
    }
  }, [selectedVendedor, currentMonth]);

  async function fetchVendedores() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar vendedores');
      console.error(error);
    } else {
      setVendedores(data || []);
    }
    setIsLoading(false);
  }

  async function fetchMonthData(vendedorId: string) {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('dados_diarios')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .gte('data', startDate.toISOString().split('T')[0])
      .lte('data', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error(error);
      return;
    }

    const dataMap = new Map<string, DadoDiario>();
    (data || []).forEach((d) => {
      dataMap.set(d.data, d);
    });
    setMonthData(dataMap);
  }

  async function addVendedor() {
    if (!novoNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const { error } = await supabase.from('vendedores').insert({
      nome: novoNome.trim(),
      foto_url: novoFotoUrl.trim() || null,
      cargo: novoCargo.trim() || 'Vendedor(a)',
      squad_id: novoSquadId || null,
    });

    if (error) {
      toast.error('Erro ao adicionar vendedor');
      console.error(error);
    } else {
      toast.success('Vendedor adicionado!');
      setNovoNome('');
      setNovoFotoUrl('');
      setNovoCargo('Vendedor(a)');
      setNovoSquadId('');
      fetchVendedores();
    }
  }

  function startEditVendedor(v: Vendedor) {
    setEditingVendedor(v.id);
    setEditNome(v.nome);
    setEditFotoUrl(v.foto_url || '');
    setEditCargo(v.cargo || 'Vendedor(a)');
    setEditSquadId(v.squad_id || '');
  }

  function cancelEditVendedor() {
    setEditingVendedor(null);
    setEditNome('');
    setEditFotoUrl('');
    setEditCargo('');
    setEditSquadId('');
  }

  async function saveEditVendedor(vendedorId: string) {
    if (!editNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const { error } = await supabase
      .from('vendedores')
      .update({
        nome: editNome.trim(),
        foto_url: editFotoUrl.trim() || null,
        cargo: editCargo.trim() || 'Vendedor(a)',
        squad_id: editSquadId || null,
      })
      .eq('id', vendedorId);

    if (error) {
      toast.error('Erro ao atualizar vendedor');
      console.error(error);
    } else {
      toast.success('Vendedor atualizado!');
      cancelEditVendedor();
      fetchVendedores();
    }
  }

  async function deleteVendedor(vendedorId: string) {
    const { error: dataError } = await supabase
      .from('dados_diarios')
      .delete()
      .eq('vendedor_id', vendedorId);

    if (dataError) {
      toast.error('Erro ao excluir dados do vendedor');
      console.error(dataError);
      return;
    }

    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', vendedorId);

    if (error) {
      toast.error('Erro ao excluir vendedor');
      console.error(error);
    } else {
      toast.success('Vendedor excluído!');
      if (selectedVendedor?.id === vendedorId) {
        setSelectedVendedor(null);
      }
      fetchVendedores();
    }
  }

  async function handleAddSquad() {
    if (!novoSquadNome.trim()) {
      toast.error('Nome do squad é obrigatório');
      return;
    }
    try {
      await addSquad(novoSquadNome.trim(), novoSquadCor, novoSquadFoto.trim() || undefined);
      toast.success('Squad criado!');
      setNovoSquadNome('');
      setNovoSquadCor('#3B82F6');
      setNovoSquadFoto('');
    } catch (error) {
      toast.error('Erro ao criar squad');
      console.error(error);
    }
  }

  function startEditSquad(squad: { id: string; nome: string; cor: string; fotoUrl?: string }) {
    setEditingSquad(squad.id);
    setEditSquadNome(squad.nome);
    setEditSquadCor(squad.cor);
    setEditSquadFoto(squad.fotoUrl || '');
  }

  function cancelEditSquad() {
    setEditingSquad(null);
    setEditSquadNome('');
    setEditSquadCor('');
    setEditSquadFoto('');
  }

  async function saveEditSquad(squadId: string) {
    if (!editSquadNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await updateSquad(squadId, editSquadNome.trim(), editSquadCor, editSquadFoto.trim() || undefined);
      toast.success('Squad atualizado!');
      cancelEditSquad();
    } catch (error) {
      toast.error('Erro ao atualizar squad');
      console.error(error);
    }
  }

  async function handleDeleteSquad(squadId: string) {
    try {
      await deleteSquad(squadId);
      toast.success('Squad excluído!');
      fetchVendedores(); // Refresh to update vendedores without squad
    } catch (error) {
      toast.error('Erro ao excluir squad');
      console.error(error);
    }
  }

  async function handleAddVendaIndividual() {
    if (!vendaVendedorId) {
      toast.error('Selecione um vendedor');
      return;
    }
    if (!novaVendaValor && !novaVendaEntrada) {
      toast.error('Preencha pelo menos um valor');
      return;
    }
    if (novaVendaMetodos.length === 0) {
      toast.error('Selecione pelo menos um método de pagamento');
      return;
    }

    try {
      await addVenda({
        vendedor_id: vendaVendedorId,
        data: novaVendaData,
        valor_venda: parseFloat(novaVendaValor.replace(',', '.')) || 0,
        valor_entrada: parseFloat(novaVendaEntrada.replace(',', '.')) || 0,
        metodo_pagamento: novaVendaMetodos.join(','),
        tipo_venda: novaVendaTipo,
      });
      toast.success('Venda registrada!');
      setNovaVendaValor('');
      setNovaVendaEntrada('');
      setNovaVendaMetodos(['pix']);
      setNovaVendaTipo('lead');
    } catch (error) {
      toast.error('Erro ao registrar venda');
      console.error(error);
    }
  }

  function toggleMetodoPagamento(metodo: string) {
    setNovaVendaMetodos(prev => 
      prev.includes(metodo) 
        ? prev.filter(m => m !== metodo)
        : [...prev, metodo]
    );
  }

  async function handleDeleteVendaIndividual(id: string) {
    try {
      await deleteVenda(id);
      toast.success('Venda removida!');
    } catch (error) {
      toast.error('Erro ao remover venda');
      console.error(error);
    }
  }

  function startEditVenda(venda: { id: string; vendedor_id: string; data: string; valor_venda: number; valor_entrada: number; tipo_venda: string; metodo_pagamento: string }) {
    setEditingVenda(venda.id);
    setEditVendaVendedorId(venda.vendedor_id);
    setEditVendaData(venda.data);
    setEditVendaValor(venda.valor_venda.toString().replace('.', ','));
    setEditVendaEntrada(venda.valor_entrada.toString().replace('.', ','));
    setEditVendaTipo(venda.tipo_venda as 'call' | 'lead');
    setEditVendaMetodos(venda.metodo_pagamento.split(',').map(m => m.trim()));
  }

  function cancelEditVenda() {
    setEditingVenda(null);
    setEditVendaVendedorId('');
    setEditVendaData('');
    setEditVendaValor('');
    setEditVendaEntrada('');
    setEditVendaTipo('lead');
    setEditVendaMetodos([]);
  }

  async function saveEditVenda() {
    if (!editingVenda) return;
    
    try {
      const { error } = await supabase
        .from('vendas_individuais')
        .update({
          vendedor_id: editVendaVendedorId,
          data: editVendaData,
          valor_venda: parseFloat(editVendaValor.replace(',', '.')) || 0,
          valor_entrada: parseFloat(editVendaEntrada.replace(',', '.')) || 0,
          tipo_venda: editVendaTipo,
          metodo_pagamento: editVendaMetodos.join(','),
        })
        .eq('id', editingVenda);

      if (error) throw error;
      toast.success('Venda atualizada!');
      cancelEditVenda();
      // Refresh vendas
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao atualizar venda');
      console.error(error);
    }
  }

  function toggleEditMetodoPagamento(metodo: string) {
    setEditVendaMetodos(prev => 
      prev.includes(metodo) 
        ? prev.filter(m => m !== metodo)
        : [...prev, metodo]
    );
  }

  async function updateDayData(day: number, field: keyof DadoDiario, value: number) {
    if (!selectedVendedor) return;

    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existingData = monthData.get(dateStr);

    if (existingData) {
      const updates: Record<string, number> = { [field]: value };
      
      if (field === 'vendas_calls') {
        updates.vendas = value + (existingData.vendas_leads || 0);
      } else if (field === 'vendas_leads') {
        updates.vendas = (existingData.vendas_calls || 0) + value;
      }

      const { error } = await supabase
        .from('dados_diarios')
        .update(updates)
        .eq('id', existingData.id);

      if (error) {
        toast.error('Erro ao atualizar');
        console.error(error);
      } else {
        setMonthData(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(dateStr);
          if (current) {
            newMap.set(dateStr, { ...current, ...updates });
          }
          return newMap;
        });
      }
    } else {
      const vendas_calls = field === 'vendas_calls' ? value : 0;
      const vendas_leads = field === 'vendas_leads' ? value : 0;
      
      const newRecord = {
        vendedor_id: selectedVendedor.id,
        data: dateStr,
        calls: field === 'calls' ? value : 0,
        leads_atendidos: field === 'leads_atendidos' ? value : 0,
        vendas: vendas_calls + vendas_leads,
        vendas_calls,
        vendas_leads,
        valor_venda: field === 'valor_venda' ? value : 0,
        valor_entrada: field === 'valor_entrada' ? value : 0,
      };

      const { data, error } = await supabase
        .from('dados_diarios')
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar registro');
        console.error(error);
      } else if (data) {
        setMonthData(prev => {
          const newMap = new Map(prev);
          newMap.set(dateStr, data);
          return newMap;
        });
      }
    }
  }

  function getDayData(day: number): DadoDiario | undefined {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthData.get(dateStr);
  }

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  const monthTotals = {
    calls: 0,
    leads: 0,
    vendas: 0,
    vendasCalls: 0,
    vendasLeads: 0,
    valorVenda: 0,
    valorEntrada: 0,
  };

  monthData.forEach((d) => {
    monthTotals.calls += d.calls;
    monthTotals.leads += d.leads_atendidos;
    monthTotals.vendasCalls += d.vendas_calls || 0;
    monthTotals.vendasLeads += d.vendas_leads || 0;
    monthTotals.valorVenda += Number(d.valor_venda);
    monthTotals.valorEntrada += Number(d.valor_entrada);
  });
  
  monthTotals.vendas = monthTotals.vendasCalls + monthTotals.vendasLeads;

  const taxaConversaoLeads = monthTotals.leads > 0 
    ? ((monthTotals.vendasLeads / monthTotals.leads) * 100).toFixed(1) 
    : '0.0';
  
  const taxaConversaoCalls = monthTotals.calls > 0 
    ? ((monthTotals.vendasCalls / monthTotals.calls) * 100).toFixed(1) 
    : '0.0';

  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const getSquadName = (squadId: string | null) => {
    if (!squadId) return null;
    const squad = squads.find(s => s.id === squadId);
    return squad?.nome || null;
  };

  const getSquadColor = (squadId: string | null) => {
    if (!squadId) return null;
    const squad = squads.find(s => s.id === squadId);
    return squad?.cor || null;
  };

  return (
    <div ref={ref} className="min-h-screen bg-background p-3 md:p-4 overflow-y-auto">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel de Controle</h1>
              <p className="text-muted-foreground text-xs">Gerencie vendedores, squads e registre dados diários</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="registrar" className="w-full">
          <TabsList className="grid w-full grid-cols-7 max-w-4xl h-9">
            <TabsTrigger value="registrar" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-3 w-3" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="vendas" className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-3 w-3" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="vendedores" className="flex items-center gap-2 text-sm">
              <User className="h-3 w-3" />
              Vendedores
            </TabsTrigger>
            <TabsTrigger value="squads" className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3" />
              Squads
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-2 text-sm">
              <Target className="h-3 w-3" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="personalizar" className="flex items-center gap-2 text-sm">
              <Palette className="h-3 w-3" />
              Personalizar
            </TabsTrigger>
            <TabsTrigger value="conta" className="flex items-center gap-2 text-sm">
              <CreditCard className="h-3 w-3" />
              Conta
            </TabsTrigger>
          </TabsList>

          {/* Tab: Registrar Dados */}
          <TabsContent value="registrar" className="space-y-3 mt-3 pb-8">
            {vendedores.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">Nenhum vendedor cadastrado.</p>
                  <p className="text-xs text-muted-foreground">Vá para a aba "Vendedores" para adicionar.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Top: Vendedor Selection + Month Navigator */}
                <Card>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Vendedor Selector */}
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        <span className="text-xs text-muted-foreground">Vendedor:</span>
                        {vendedores.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVendedor(v)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                              selectedVendedor?.id === v.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                            style={v.squad_id ? { borderLeft: `3px solid ${getSquadColor(v.squad_id)}` } : {}}
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={v.foto_url || undefined} />
                              <AvatarFallback className="text-[8px]">
                                {v.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{v.nome.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>

                      {/* Month Navigator */}
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium min-w-[120px] text-center capitalize">
                          {monthName}
                        </span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Spreadsheet View */}
                <Card>
                  {selectedVendedor ? (
                    <>
                      {/* Month Totals Summary */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 border-b">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">Total Calls</p>
                          <p className="text-lg font-bold text-foreground">{monthTotals.calls}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">Total Leads</p>
                          <p className="text-lg font-bold text-foreground">{monthTotals.leads}</p>
                        </div>
                      </div>

                      {/* Spreadsheet Grid */}
                      <CardContent className="p-0">
                        <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-muted/90 z-10">
                              <tr className="border-b">
                                <th className="p-2 text-left font-medium text-muted-foreground w-16">Dia</th>
                                <th className="p-2 text-center font-medium text-muted-foreground">☎️ Calls</th>
                                <th className="p-2 text-center font-medium text-muted-foreground">💬 Leads</th>
                              </tr>
                            </thead>
                            <tbody>
                              {monthDays.map((day) => {
                                const dayData = getDayData(day);
                                const isToday = new Date().getDate() === day && 
                                  new Date().getMonth() === currentMonth.getMonth() &&
                                  new Date().getFullYear() === currentMonth.getFullYear();

                                return (
                                  <tr key={day} className={`border-b hover:bg-muted/20 ${isToday ? 'bg-primary/5' : ''}`}>
                                    <td className={`p-2 font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                                      {day}
                                    </td>
                                    <td className="p-1">
                                      <SpreadsheetInput
                                        value={dayData ? dayData.calls : 0}
                                        onChange={(v) => updateDayData(day, 'calls', v)}
                                        isToday={isToday}
                                      />
                                    </td>
                                    <td className="p-1">
                                      <SpreadsheetInput
                                        value={dayData ? dayData.leads_atendidos : 0}
                                        onChange={(v) => updateDayData(day, 'leads_atendidos', v)}
                                        isToday={isToday}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="py-8 text-center">
                      <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm">Selecione um vendedor acima para ver e editar os dados.</p>
                    </CardContent>
                  )}
                </Card>

              </div>
            )}
          </TabsContent>

          {/* Tab: Vendas */}
          <TabsContent value="vendas" className="space-y-3 mt-3 pb-8">
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Todas as Vendas Individuais
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-medium min-w-[120px] text-center capitalize">
                      {monthName}
                    </span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {/* Add new sale form */}
                <div className="flex flex-wrap gap-2 items-end p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Vendedor</Label>
                    <Select value={vendaVendedorId} onValueChange={setVendaVendedorId}>
                      <SelectTrigger className="h-8 text-xs w-40">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        {vendedores.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Data</Label>
                    <Input
                      type="date"
                      value={novaVendaData}
                      onChange={(e) => setNovaVendaData(e.target.value)}
                      className="h-8 text-xs w-32"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Valor Venda</Label>
                    <Input
                      placeholder="0,00"
                      value={novaVendaValor}
                      onChange={(e) => setNovaVendaValor(e.target.value)}
                      className="h-8 text-xs w-28"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Valor Entrada</Label>
                    <Input
                      placeholder="0,00"
                      value={novaVendaEntrada}
                      onChange={(e) => setNovaVendaEntrada(e.target.value)}
                      className="h-8 text-xs w-28"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Tipo</Label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setNovaVendaTipo('call')}
                        className={`px-3 py-1 text-[10px] rounded border transition-colors ${
                          novaVendaTipo === 'call'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        📞 Call
                      </button>
                      <button
                        type="button"
                        onClick={() => setNovaVendaTipo('lead')}
                        className={`px-3 py-1 text-[10px] rounded border transition-colors ${
                          novaVendaTipo === 'lead'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        💬 Lead
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Pagamento (múltiplo)</Label>
                    <div className="flex flex-wrap gap-1">
                      {METODOS_PAGAMENTO.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => toggleMetodoPagamento(m.value)}
                          className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                            novaVendaMetodos.includes(m.value)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={handleAddVendaIndividual} className="h-8">
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {/* Sales list */}
                {todasVendas.length > 0 ? (
                  <div className="space-y-2">
                    <div className="max-h-[500px] overflow-y-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/90 sticky top-0">
                        <tr className="border-b">
                          <th className="p-2 text-left font-medium text-muted-foreground">Data</th>
                          <th className="p-2 text-left font-medium text-muted-foreground">Vendedor</th>
                          <th className="p-2 text-right font-medium text-muted-foreground">Valor Venda</th>
                          <th className="p-2 text-right font-medium text-muted-foreground">Valor Entrada</th>
                          <th className="p-2 text-center font-medium text-muted-foreground">Tipo</th>
                          <th className="p-2 text-center font-medium text-muted-foreground">Pagamento</th>
                          <th className="p-2 text-center font-medium text-muted-foreground w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {todasVendas
                          .slice((vendasListPage - 1) * vendasListPerPage, vendasListPage * vendasListPerPage)
                          .map((venda) => {
                            const vendedor = vendedores.find(v => v.id === venda.vendedor_id);
                            const metodos = venda.metodo_pagamento.split(',').map(m => 
                              METODOS_PAGAMENTO.find(mp => mp.value === m.trim())?.label || m.trim()
                            );
                            return (
                              <tr key={venda.id} className="border-b hover:bg-muted/20">
                                <td className="p-2 font-medium">
                                  {new Date(venda.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={vendedor?.foto_url || undefined} />
                                      <AvatarFallback className="text-[8px]">
                                        {vendedor?.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'N/A'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{vendedor?.nome || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="p-2 text-right font-medium text-primary">
                                  R$ {Number(venda.valor_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-right font-medium text-primary">
                                  R$ {Number(venda.valor_entrada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    venda.tipo_venda === 'call' 
                                      ? 'bg-blue-500/20 text-blue-400' 
                                      : 'bg-green-500/20 text-green-400'
                                  }`}>
                                    {venda.tipo_venda === 'call' ? '📞 Call' : '💬 Lead'}
                                  </span>
                                </td>
                                <td className="p-2 text-center">
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {metodos.map((m, i) => (
                                      <span key={i} className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={() => startEditVenda(venda)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir venda?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteVendaIndividual(venda.id)}>
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    </div>
                    
                    {/* Pagination */}
                    {todasVendas.length > vendasListPerPage && (
                      <div className="flex items-center justify-between px-2 py-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Mostrando {((vendasListPage - 1) * vendasListPerPage) + 1}-{Math.min(vendasListPage * vendasListPerPage, todasVendas.length)} de {todasVendas.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setVendasListPage(p => Math.max(1, p - 1))}
                            disabled={vendasListPage === 1}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium px-2">
                            {vendasListPage} / {Math.ceil(todasVendas.length / vendasListPerPage)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setVendasListPage(p => Math.min(Math.ceil(todasVendas.length / vendasListPerPage), p + 1))}
                            disabled={vendasListPage >= Math.ceil(todasVendas.length / vendasListPerPage)}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg mt-4">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Total Vendas</p>
                        <p className="text-lg font-bold text-primary">{todasVendas.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Valor Total</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {todasVendas.reduce((sum, v) => sum + Number(v.valor_venda), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Entrada Total</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {todasVendas.reduce((sum, v) => sum + Number(v.valor_entrada), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Nenhuma venda registrada neste mês.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Edit Venda Dialog */}
            <Dialog open={!!editingVenda} onOpenChange={(open) => !open && cancelEditVenda()}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm">Editar Venda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Vendedor</Label>
                    <Select value={editVendaVendedorId} onValueChange={setEditVendaVendedorId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        {vendedores.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      value={editVendaData}
                      onChange={(e) => setEditVendaData(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Venda</Label>
                      <Input
                        placeholder="0,00"
                        value={editVendaValor}
                        onChange={(e) => setEditVendaValor(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Entrada</Label>
                      <Input
                        placeholder="0,00"
                        value={editVendaEntrada}
                        onChange={(e) => setEditVendaEntrada(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditVendaTipo('call')}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                          editVendaTipo === 'call'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        📞 Call
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditVendaTipo('lead')}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                          editVendaTipo === 'lead'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        💬 Lead
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Método de Pagamento</Label>
                    <div className="flex flex-wrap gap-1">
                      {METODOS_PAGAMENTO.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => toggleEditMetodoPagamento(m.value)}
                          className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                            editVendaMetodos.includes(m.value)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={cancelEditVenda} className="flex-1 h-8 text-xs">
                      Cancelar
                    </Button>
                    <Button onClick={saveEditVenda} className="flex-1 h-8 text-xs">
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Tab: Vendedores */}
          <TabsContent value="vendedores" className="space-y-3 mt-3">
            {/* Add Vendedor Form */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Adicionar Vendedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="space-y-1">
                    <Label htmlFor="nome" className="text-xs">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Nome completo"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cargo" className="text-xs">Cargo</Label>
                    <Input
                      id="cargo"
                      placeholder="Vendedor(a)"
                      value={novoCargo}
                      onChange={(e) => setNovoCargo(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <ImageUpload
                    value={novoFotoUrl}
                    onChange={setNovoFotoUrl}
                    bucket="vendedor-fotos"
                    folder="vendedores"
                    label="Foto do Vendedor"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="squad" className="text-xs">Squad</Label>
                    <Select value={novoSquadId || "__none__"} onValueChange={(v) => setNovoSquadId(v === "__none__" ? "" : v)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Sem squad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Sem squad</SelectItem>
                        {squads.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
                              {s.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addVendedor} size="sm" className="w-full md:w-auto">
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Vendedor
                </Button>
              </CardContent>
            </Card>

            {/* Vendedores List */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Vendedores Cadastrados ({vendedores.length})</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {vendedores.length === 0 ? (
                  <p className="text-muted-foreground text-center py-3 text-sm">Nenhum vendedor cadastrado ainda.</p>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {vendedores.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-2 p-2 rounded-md border border-border bg-card"
                        style={v.squad_id ? { borderLeftWidth: '4px', borderLeftColor: getSquadColor(v.squad_id) || undefined } : {}}
                      >
                        {editingVendedor === v.id ? (
                          // Edit Mode
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={editFotoUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {editNome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <Input
                                value={editNome}
                                onChange={(e) => setEditNome(e.target.value)}
                                placeholder="Nome"
                                className="h-7 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={editCargo}
                                onChange={(e) => setEditCargo(e.target.value)}
                                placeholder="Cargo"
                                className="h-7 text-xs"
                              />
                              <Select value={editSquadId || "__none__"} onValueChange={(v) => setEditSquadId(v === "__none__" ? "" : v)}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Squad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">Sem squad</SelectItem>
                                  {squads.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.cor }} />
                                        {s.nome}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <ImageUpload
                              value={editFotoUrl}
                              onChange={setEditFotoUrl}
                              bucket="vendedor-fotos"
                              folder="vendedores"
                              label="Foto"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="h-7 flex-1"
                                onClick={() => saveEditVendedor(v.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={cancelEditVendedor}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={v.foto_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {v.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{v.nome}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-muted-foreground">{v.cargo}</p>
                                {v.squad_id && (
                                  <span 
                                    className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: getSquadColor(v.squad_id) || '#666' }}
                                  >
                                    {getSquadName(v.squad_id)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => startEditVendedor(v)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir vendedor?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Isso irá excluir <strong>{v.nome}</strong> e todos os dados diários associados. 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteVendedor(v.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Squads */}
          <TabsContent value="squads" className="space-y-3 mt-3">
            {/* Add Squad Form */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Criar Squad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="space-y-1">
                    <Label htmlFor="squadNome" className="text-xs">Nome do Squad *</Label>
                    <Input
                      id="squadNome"
                      placeholder="Ex: Time Alpha"
                      value={novoSquadNome}
                      onChange={(e) => setNovoSquadNome(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="squadCor" className="text-xs">Cor</Label>
                    <Select value={novoSquadCor} onValueChange={setNovoSquadCor}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: novoSquadCor }} />
                            {SQUAD_COLORS.find(c => c.value === novoSquadCor)?.label || 'Cor'}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SQUAD_COLORS.map((cor) => (
                          <SelectItem key={cor.value} value={cor.value}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cor.value }} />
                              {cor.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="squadFoto" className="text-xs">URL da Foto</Label>
                    <Input
                      id="squadFoto"
                      placeholder="https://..."
                      value={novoSquadFoto}
                      onChange={(e) => setNovoSquadFoto(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddSquad} size="sm" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Criar Squad
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Squads List */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Squads Cadastrados ({squads.length})</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {squads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-3 text-sm">Nenhum squad cadastrado ainda.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {squads.map((squad) => {
                      const squadVendedores = vendedores.filter(v => v.squad_id === squad.id);
                      
                      return (
                        <div
                          key={squad.id}
                          className="p-3 rounded-lg border-2 bg-card"
                          style={{ borderColor: squad.cor }}
                        >
                          {editingSquad === squad.id ? (
                            // Edit Mode
                            <div className="space-y-2">
                              <Input
                                value={editSquadNome}
                                onChange={(e) => setEditSquadNome(e.target.value)}
                                placeholder="Nome"
                                className="h-8 text-sm"
                              />
                              <Select value={editSquadCor} onValueChange={setEditSquadCor}>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: editSquadCor }} />
                                      {SQUAD_COLORS.find(c => c.value === editSquadCor)?.label}
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {SQUAD_COLORS.map((cor) => (
                                    <SelectItem key={cor.value} value={cor.value}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cor.value }} />
                                        {cor.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                value={editSquadFoto}
                                onChange={(e) => setEditSquadFoto(e.target.value)}
                                placeholder="URL da foto"
                                className="h-8 text-sm"
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 flex-1"
                                  onClick={() => saveEditSquad(squad.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7"
                                  onClick={cancelEditSquad}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {squad.fotoUrl ? (
                                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: squad.cor }}>
                                      <AvatarImage src={squad.fotoUrl} alt={squad.nome} />
                                      <AvatarFallback style={{ backgroundColor: squad.cor }} className="text-white text-xs">
                                        {squad.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: squad.cor }}>
                                      {squad.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <h4 className="font-bold text-sm">{squad.nome}</h4>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => startEditSquad(squad)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir squad?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Isso irá excluir o squad <strong>{squad.nome}</strong>. 
                                          Os vendedores não serão excluídos, apenas desvinculados.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteSquad(squad.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              
                              {/* Squad Members */}
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {squadVendedores.length} membro{squadVendedores.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {squadVendedores.map((v) => (
                                    <div key={v.id} className="flex items-center gap-1 bg-muted/50 rounded px-1.5 py-0.5">
                                      <Avatar className="h-4 w-4">
                                        <AvatarImage src={v.foto_url || undefined} />
                                        <AvatarFallback className="text-[6px]">
                                          {v.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-[10px]">{v.nome.split(' ')[0]}</span>
                                    </div>
                                  ))}
                                  {squadVendedores.length === 0 && (
                                    <p className="text-[10px] text-muted-foreground italic">
                                      Nenhum membro. Edite um vendedor para adicionar.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Metas */}
          <TabsContent value="metas" className="space-y-3 mt-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Definir Metas Mensais
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center capitalize">
                    {monthName}
                  </span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaValorEntrada" className="text-sm flex items-center gap-1">
                      💰 Meta de Valor de Entrada (R$)
                    </Label>
                    <Input
                      id="metaValorEntrada"
                      type="number"
                      placeholder="0"
                      value={metaValorEntrada}
                      onChange={(e) => setMetaValorEntrada(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaValorVendas" className="text-sm flex items-center gap-1">
                      💵 Meta de Valor de Vendas (R$)
                    </Label>
                    <Input
                      id="metaValorVendas"
                      type="number"
                      placeholder="0"
                      value={metaValorVendas}
                      onChange={(e) => setMetaValorVendas(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaVendas" className="text-sm flex items-center gap-1">
                      📈 Meta de Quantidade de Vendas
                    </Label>
                    <Input
                      id="metaVendas"
                      type="number"
                      placeholder="0"
                      value={metaVendas}
                      onChange={(e) => setMetaVendas(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaCalls" className="text-sm flex items-center gap-1">
                      ☎️ Meta de Calls
                    </Label>
                    <Input
                      id="metaCalls"
                      type="number"
                      placeholder="0"
                      value={metaCalls}
                      onChange={(e) => setMetaCalls(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaLeads" className="text-sm flex items-center gap-1">
                      💬 Meta de Leads
                    </Label>
                    <Input
                      id="metaLeads"
                      type="number"
                      placeholder="0"
                      value={metaLeads}
                      onChange={(e) => setMetaLeads(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveMeta} disabled={isSavingMeta} className="w-full md:w-auto">
                  {isSavingMeta ? 'Salvando...' : 'Salvar Metas'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Personalizar */}
          <TabsContent value="personalizar" className="space-y-3 mt-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Personalizar Sistema
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Personalize o nome, cores e logo do sistema para sua empresa
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome do Sistema */}
                  <div className="space-y-2">
                    <Label htmlFor="configNome" className="text-sm flex items-center gap-1">
                      📝 Nome do Sistema
                    </Label>
                    <Input
                      id="configNome"
                      type="text"
                      placeholder="NextApps"
                      value={configNome}
                      onChange={(e) => setConfigNome(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  {/* Logo com Upload ou URL */}
                  <div className="space-y-2">
                    <ImageUpload
                      value={configLogo}
                      onChange={setConfigLogo}
                      bucket="vendedor-fotos"
                      folder="logos"
                      label="🖼️ Logo do Sistema"
                    />
                  </div>

                  {/* Cor Primária */}
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      🎨 Cor Primária
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={configCorPrimaria}
                        onChange={(e) => setConfigCorPrimaria(e.target.value)}
                        className="h-9 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={configCorPrimaria}
                        onChange={(e) => setConfigCorPrimaria(e.target.value)}
                        placeholder="#22C55E"
                        className="h-9 flex-1"
                      />
                    </div>
                    <div className="flex gap-1 mt-1">
                      {['#22C55E', '#10B981', '#059669', '#047857', '#166534'].map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          onClick={() => setConfigCorPrimaria(cor)}
                          className={`w-6 h-6 rounded border-2 transition-all ${configCorPrimaria === cor ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: cor }}
                          title={cor}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cor Secundária */}
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      🎨 Cor Secundária
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={configCorSecundaria}
                        onChange={(e) => setConfigCorSecundaria(e.target.value)}
                        className="h-9 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={configCorSecundaria}
                        onChange={(e) => setConfigCorSecundaria(e.target.value)}
                        placeholder="#3B82F6"
                        className="h-9 flex-1"
                      />
                    </div>
                    <div className="flex gap-1 mt-1">
                      {['#3B82F6', '#2563EB', '#1D4ED8', '#8B5CF6', '#EC4899'].map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          onClick={() => setConfigCorSecundaria(cor)}
                          className={`w-6 h-6 rounded border-2 transition-all ${configCorSecundaria === cor ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: cor }}
                          title={cor}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-3">Preview:</p>
                  <div className="flex items-center gap-3">
                    {configLogo ? (
                      <img 
                        src={configLogo} 
                        alt="Logo"
                        className="w-10 h-10 rounded-lg object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${configCorPrimaria}, ${configCorSecundaria})` 
                        }}
                      >
                        <span className="text-white font-black text-lg">
                          {configNome?.charAt(0)?.toUpperCase() || 'N'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-lg font-bold">
                        {configNome?.split(/(?=[A-Z])/).map((part, i) => (
                          <span key={i} style={i === 1 ? { color: configCorPrimaria } : {}}>
                            {part}
                          </span>
                        )) || 'NextApps'}
                      </h1>
                      <div className="flex gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: configCorPrimaria }} />
                          <span className="text-[10px] text-muted-foreground">Primária</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: configCorSecundaria }} />
                          <span className="text-[10px] text-muted-foreground">Secundária</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveConfig} disabled={isSavingConfig} className="w-full md:w-auto">
                  {isSavingConfig ? 'Salvando...' : 'Salvar Personalização'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Conta */}
          <TabsContent value="conta" className="space-y-4 mt-3 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assinatura */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingAccount ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : subscription && plan ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg border">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <p className="text-lg font-bold mt-2">
                          R$ {(plan.price_cents / 100).toFixed(2)}/{plan.interval === 'month' ? 'mês' : plan.interval}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            subscription.status === 'active' ? 'bg-green-500/20 text-green-500' :
                            subscription.status === 'canceled' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {subscription.status === 'active' ? 'Ativa' :
                             subscription.status === 'canceled' ? 'Cancelada' :
                             subscription.status === 'past_due' ? 'Pagamento Pendente' :
                             subscription.status}
                          </span>
                        </div>
                        {subscription.current_period_end && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Próxima cobrança: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>

                      {subscription.status === 'active' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full text-destructive border-destructive/50 hover:bg-destructive/10">
                              Cancelar Assinatura
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sua assinatura permanecerá ativa até o final do período atual. Após isso, você perderá acesso aos recursos premium.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Voltar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={cancelSubscription}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirmar Cancelamento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa</p>
                      <Button className="mt-3" variant="outline" disabled>
                        Ver Planos (em breve)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Métodos de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    💳 Métodos de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingAccount ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : paymentMethods.length > 0 ? (
                    <div className="space-y-2">
                      {paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {pm.type === 'credit_card' ? '💳' : 
                               pm.type === 'pix' ? '⚡' : 
                               pm.type === 'boleto' ? '📄' : '💰'}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {pm.brand || pm.type.replace('_', ' ').toUpperCase()} 
                                {pm.last_four_digits && ` •••• ${pm.last_four_digits}`}
                              </p>
                              {pm.exp_month && pm.exp_year && (
                                <p className="text-xs text-muted-foreground">
                                  Exp: {pm.exp_month.toString().padStart(2, '0')}/{pm.exp_year}
                                </p>
                              )}
                            </div>
                            {pm.is_default && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                Padrão
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!pm.is_default && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setDefaultPaymentMethod(pm.id)}
                                title="Definir como padrão"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover método de pagamento?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Este método será removido da sua conta.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removePaymentMethod(pm.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum método cadastrado</p>
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Método (em breve)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Ações da Conta */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Zona de Perigo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zerar Dados */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Zerar Dados
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Remove todos os vendedores, squads, metas e vendas. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                        Zerar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Zerar todos os dados?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso irá remover permanentemente todos os vendedores, squads, metas e dados de vendas. 
                          Sua conta e assinatura permanecerão intactas. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={resetData}
                          className="bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Zerar Tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Excluir Conta */}
                <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/30">
                  <div>
                    <p className="font-medium flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Excluir Conta
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Remove permanentemente sua conta e todos os dados associados.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Excluir Conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <span className="block text-destructive font-medium mb-2">⚠️ ATENÇÃO: Esta ação é irreversível!</span>
                          Isso irá:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Cancelar qualquer assinatura ativa</li>
                            <li>Remover todos os seus dados</li>
                            <li>Excluir sua conta permanentemente</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={deleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir Permanentemente
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

export default Admin;
