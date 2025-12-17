import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield,
  Layers,
  RefreshCw,
  UserPlus,
  Trophy,
  Phone,
  CreditCard,
  Calendar
} from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Ranking de Vendas Visual",
    description: "Veja o pódio completo com seus top vendedores. Posições 1º, 2º, 3º com medalhas e destaque visual para motivar a competição saudável."
  },
  {
    icon: BarChart3,
    title: "Métricas em Tempo Real",
    description: "Vendas totais, valor de vendas, valor de entrada, tudo atualizado automaticamente. Acompanhe o desempenho do mês inteiro em segundos."
  },
  {
    icon: TrendingUp,
    title: "Taxa de Conversão Detalhada",
    description: "Monitore conversão geral, de calls e de leads separadamente. Identifique qual canal traz mais resultados para cada vendedor."
  },
  {
    icon: Phone,
    title: "Controle de Calls e Leads",
    description: "Registre calls e leads diários por vendedor. Veja o total do mês e acompanhe a evolução dia a dia no painel de controle."
  },
  {
    icon: Layers,
    title: "Criação de Squads",
    description: "Organize vendedores em equipes e acompanhe o desempenho coletivo. Crie competições entre squads e motive o trabalho em equipe."
  },
  {
    icon: CreditCard,
    title: "Formas de Pagamento",
    description: "Registre vendas com PIX, Cartão de Crédito, Débito, Boleto, Dinheiro ou Transferência. Veja a porcentagem de cada forma por vendedor."
  },
  {
    icon: Target,
    title: "Metas do Mês Visuais",
    description: "Defina metas de entrada, vendas, calls e leads. Barras de progresso mostram exatamente quanto falta para bater cada objetivo."
  },
  {
    icon: Calendar,
    title: "Histórico Completo de Vendas",
    description: "Todas as vendas individuais registradas com data, vendedor, valor, tipo (call/lead) e pagamento. Filtre e encontre qualquer venda rapidamente."
  },
  {
    icon: UserPlus,
    title: "Gestão de Vendedores",
    description: "Adicione vendedores com foto, cargo e squad. Edite ou remova a qualquer momento. Sem limite de cadastros na plataforma."
  },
  {
    icon: RefreshCw,
    title: "Preenchimento Automático",
    description: "Seu time registra vendas de forma rápida e simples. Menos trabalho manual, mais tempo focado em fechar negócios."
  },
  {
    icon: Users,
    title: "Multiusuários Ilimitados",
    description: "Adicione quantos gestores e vendedores precisar. Cada um acessa seu painel e registra suas próprias vendas."
  },
  {
    icon: Shield,
    title: "Simples e Intuitivo",
    description: "Interface pensada para o dia a dia corrido. Seu time aprende a usar em minutos com abas claras: Dados, Vendas, Vendedores, Squads, Metas."
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
            Tudo que Você Precisa para{" "}
            <span className="text-gradient">Controlar Vendas Visualmente</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Dashboard completo com ranking, métricas, metas e gestão de equipe. 
            Uma ferramenta simples que transforma dados em motivação.
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