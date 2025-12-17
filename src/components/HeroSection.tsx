import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users, TrendingUp, Target, Phone, MessageSquare, BarChart3 } from "lucide-react";

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trophy Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-8 mx-auto animate-fade-in">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Chega de Planilhas.{" "}
            <span className="text-gradient italic">Seu Time Merece</span>
            <br />
            <span className="text-gradient italic">um Ranking Visual.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Vendedores motivados vendem mais. Com o ranking visual, seu time vê 
            quem está no topo, quanto falta para a meta e compete de forma saudável. 
            Experimente agora.
          </p>

          {/* Features Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary font-bold">⚡</span>
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary font-bold">⚡</span>
              <span>Sem limite de usuários</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary font-bold">⚡</span>
              <span>Suporte incluído</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto px-12"
              onClick={() => scrollToSection("precos")}
            >
              Começar por R$ 99/mês
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Mais de <span className="text-primary font-semibold">500+ times</span> já usam para bater metas
            </p>
          </div>
          {/* Dashboard Preview - Realistic based on screenshots */}
          <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="glass-strong rounded-3xl p-4 md:p-8 glow-soft">
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold font-display text-foreground">🏆 Ranking de Vendas</h3>
                    <p className="text-sm text-muted-foreground">Dezembro 2025</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="glass px-4 py-2 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">VENDAS TOTAIS</div>
                      <div className="text-lg font-bold text-foreground">49</div>
                    </div>
                    <div className="glass px-4 py-2 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">VALOR VENDAS</div>
                      <div className="text-lg font-bold text-primary">R$ 82.548</div>
                    </div>
                    <div className="glass px-4 py-2 rounded-lg text-center hidden md:block">
                      <div className="text-xs text-muted-foreground">VALOR ENTRADA</div>
                      <div className="text-lg font-bold text-primary">R$ 73.325</div>
                    </div>
                  </div>
                </div>

                {/* Podium-style Ranking Preview */}
                <div className="flex justify-center items-end gap-4 mb-8">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary border-4 border-gray-400 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🥈</span>
                    </div>
                    <div className="font-semibold text-foreground text-sm">Lucas Mendes</div>
                    <div className="text-primary font-bold">23 vendas</div>
                    <div className="text-xs text-muted-foreground">R$ 28.450</div>
                  </div>
                  
                  {/* 1st Place */}
                  <div className="text-center -mt-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-primary border-4 border-yellow-400 mx-auto mb-2 flex items-center justify-center glow-primary">
                      <span className="text-3xl">🥇</span>
                    </div>
                    <div className="font-semibold text-foreground">Carla Souza</div>
                    <div className="text-primary font-bold text-lg">31 vendas</div>
                    <div className="text-sm text-muted-foreground">R$ 45.890</div>
                  </div>
                  
                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary border-4 border-amber-700 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">🥉</span>
                    </div>
                    <div className="font-semibold text-foreground text-sm">Rafael Costa</div>
                    <div className="text-primary font-bold">18 vendas</div>
                    <div className="text-xs text-muted-foreground">R$ 21.730</div>
                  </div>
                </div>

                {/* Metrics & Goals Sidebar Preview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-xl bg-secondary/30">
                  <div className="text-center">
                    <Phone className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">CALLS</div>
                    <div className="font-bold text-foreground">168</div>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">LEADS</div>
                    <div className="font-bold text-foreground">581</div>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">CONV. GERAL</div>
                    <div className="font-bold text-primary">6.5%</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">CONV. CALLS</div>
                    <div className="font-bold text-primary">20.2%</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">CONV. LEADS</div>
                    <div className="font-bold text-primary">2.6%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;