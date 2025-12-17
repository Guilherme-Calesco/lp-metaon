import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  BarChart3, 
  Layers, 
  Target,
  Zap,
  Shield,
  HeadphonesIcon
} from "lucide-react";

const features = [
  { icon: Users, text: "Vendedores e usuários ilimitados" },
  { icon: BarChart3, text: "Dashboard com ranking visual em tempo real" },
  { icon: Layers, text: "Criação de squads e competições" },
  { icon: Target, text: "Metas de vendas, entrada, calls e leads" },
  { icon: Zap, text: "Registro de vendas com formas de pagamento" },
  { icon: Shield, text: "Controle de conversão de calls e leads" },
  { icon: HeadphonesIcon, text: "Suporte prioritário incluído" },
];

const PricingSection = () => {
  return (
    <section id="precos" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass text-primary text-sm font-medium mb-6">
            Investimento
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 text-foreground">
            Um Único Plano,{" "}
            <span className="text-gradient">Tudo Incluído</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sem surpresas, sem taxas escondidas. Acesso completo a todas as funcionalidades.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="glass-strong rounded-3xl p-8 md:p-12 glow-primary relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-primary text-primary-foreground px-6 py-2 rounded-bl-2xl font-semibold text-sm">
              Mais Popular
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="text-muted-foreground mb-2">Plano Completo</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-lg text-muted-foreground">R$</span>
                <span className="text-6xl md:text-7xl font-bold font-display text-foreground">99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Cancele quando quiser. Sem fidelidade.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                  <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button variant="glow" size="xl" className="w-full text-lg">
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* Guarantee */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              ✓ 7 dias de garantia • ✓ Suporte incluído • ✓ Sem limite de vendedores
            </p>
          </div>

          {/* Trust Elements */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Pagamento seguro via</p>
            <div className="flex items-center justify-center gap-6 opacity-60">
              <div className="glass px-4 py-2 rounded-lg text-sm text-muted-foreground">
                Cartão de Crédito
              </div>
              <div className="glass px-4 py-2 rounded-lg text-sm text-muted-foreground">
                PIX
              </div>
              <div className="glass px-4 py-2 rounded-lg text-sm text-muted-foreground">
                Boleto
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;