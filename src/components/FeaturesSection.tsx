import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Zap,
  Layers,
  RefreshCw,
  UserPlus,
  Trophy,
  Phone,
  CreditCard,
  Palette,
  FileSpreadsheet,
  PartyPopper,
  LayoutGrid,
  Eye
} from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Ranking com Podio Visual",
    description: "Veja o podio completo com medalhas de ouro, prata e bronze. 5 estilos de visualizacao: Podio, Leaderboard, Tabela, Cards e Lista."
  },
  {
    icon: BarChart3,
    title: "Metricas em Tempo Real",
    description: "Vendas totais, valor de vendas, valor de entrada, tudo atualizado automaticamente a cada 30 segundos. Acompanhe o desempenho do mes inteiro."
  },
  {
    icon: TrendingUp,
    title: "Taxa de Conversao Detalhada",
    description: "Monitore conversao geral, de calls e de leads separadamente. Identifique qual canal traz mais resultados para cada vendedor."
  },
  {
    icon: Phone,
    title: "Controle de Calls e Leads",
    description: "Registre calls e leads diarios por vendedor. Veja o total do mes e acompanhe a evolucao dia a dia no painel de controle."
  },
  {
    icon: Layers,
    title: "Gestao de Squads",
    description: "Organize vendedores em equipes com cores personalizadas. Veja o ranking por squad e motive a competicao entre times."
  },
  {
    icon: CreditCard,
    title: "Formas de Pagamento",
    description: "Registre vendas com PIX, Cartao de Credito, Debito, Boleto, Dinheiro ou Transferencia. Controle completo de cada venda."
  },
  {
    icon: Target,
    title: "Metas com Barras de Progresso",
    description: "Defina metas de entrada, vendas, calls e leads. Barras de progresso mostram exatamente quanto falta para bater cada objetivo."
  },
  {
    icon: PartyPopper,
    title: "Celebracoes Automaticas",
    description: "Quando uma venda e registrada, o sistema dispara confetes e animacoes para celebrar a conquista com todo o time."
  },
  {
    icon: Palette,
    title: "Personalizacao Total",
    description: "Customize cores, logo, favicon e nome da empresa. Deixe o dashboard com a cara da sua marca em poucos cliques."
  },
  {
    icon: FileSpreadsheet,
    title: "Exportacao de Relatorios",
    description: "Exporte ranking, vendas e dados diarios em CSV. Relatorios prontos para analise em Excel ou Google Sheets."
  },
  {
    icon: UserPlus,
    title: "Usuarios Ilimitados",
    description: "Adicione quantos gestores e vendedores precisar. Cada um acessa seu painel e registra suas proprias vendas."
  },
  {
    icon: Eye,
    title: "Modo Demo para Testar",
    description: "Experimente todas as funcionalidades sem cadastro. Teste o sistema antes de assinar e veja como funciona na pratica."
  }
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass text-primary text-sm font-medium mb-6">
            Funcionalidades Completas
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 text-foreground">
            Tudo que Voce Precisa para{" "}
            <span className="text-gradient">Motivar Seu Time de Vendas</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Dashboard completo com ranking visual, metricas, metas e gamificacao.
            Transforme dados em motivacao e veja seu time bater recordes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass rounded-2xl p-8 hover:glow-primary transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
