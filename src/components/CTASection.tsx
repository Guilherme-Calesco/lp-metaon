import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Zap } from "lucide-react";

const CTASection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary glow-primary mb-8">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display mb-6 text-foreground">
            Chega de Planilhas.{" "}
            <span className="text-gradient">Seu Time Merece um Ranking Visual.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Vendedores motivados vendem mais. Com o ranking visual, seu time vê quem está no topo, 
            quanto falta para a meta e compete de forma saudável. Experimente agora.
          </p>

          {/* Features inline */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              "Setup em 5 minutos",
              "Sem limite de usuários",
              "Suporte incluído",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="glow" 
              size="xl"
              onClick={() => scrollToSection("precos")}
            >
              Começar por R$ 99/mês
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            Mais de <span className="text-primary font-semibold">500+ times</span> já usam para bater metas
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;