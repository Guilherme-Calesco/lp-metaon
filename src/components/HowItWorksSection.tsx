import { CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Cadastre Seus Vendedores",
    description: "Adicione cada vendedor com nome, foto e cargo. Organize em squads se quiser competições entre equipes.",
    features: [
      "Upload de foto do vendedor",
      "Atribua a um squad específico",
      "Sem limite de cadastros"
    ]
  },
  {
    number: "02",
    title: "Registre Calls, Leads e Vendas",
    description: "Cada vendedor registra seus dados diários: quantos calls fez, leads recebeu e vendas fechou com valor e forma de pagamento.",
    features: [
      "Registro diário de calls e leads",
      "Vendas com valor e entrada",
      "PIX, Cartão, Boleto, Dinheiro"
    ]
  },
  {
    number: "03",
    title: "Acompanhe o Ranking em Tempo Real",
    description: "Veja quem está no topo, as taxas de conversão, o progresso das metas do mês e celebre os resultados com seu time.",
    features: [
      "Ranking atualizado automaticamente",
      "Metas com barras de progresso",
      "Métricas de conversão detalhadas"
    ]
  }
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass text-primary text-sm font-medium mb-6">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 text-foreground">
            Comece em{" "}
            <span className="text-gradient">3 Passos Simples</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Do cadastro ao primeiro ranking, você estará pronto em minutos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <div className="glass rounded-3xl p-8 relative z-10 h-full hover:glow-primary transition-all duration-500">
                {/* Step Number */}
                <div className="text-6xl font-bold font-display text-primary/20 mb-4">
                  {step.number}
                </div>
                
                <h3 className="text-2xl font-bold font-display mb-4 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  {step.description}
                </p>
                
                <ul className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;