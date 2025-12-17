import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CelebrationOverlayProps {
  vendedor: {
    nome: string;
    fotoUrl?: string;
  };
  message: string;
  onComplete: () => void;
}

export function CelebrationOverlay({ vendedor, message, onComplete }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fire confetti from both sides
    const duration = 10000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const fireworksInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(fireworksInterval);
        return;
      }

      // Random fireworks from different positions
      const particleCount = 50 * (timeLeft / duration);
      
      // Left side
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        },
        colors: ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0
      });

      // Right side
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0
      });
    }, 300);

    // Hide after 10 seconds
    const hideTimeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, duration);

    return () => {
      clearInterval(fireworksInterval);
      clearTimeout(hideTimeout);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm",
      "animate-fade-in"
    )}>
      {/* Glowing background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-yellow-500/20 via-transparent to-transparent rounded-full animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-6 p-8">
        {/* Spinning Avatar */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-48 h-48 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-spin blur-xl opacity-50" 
               style={{ animationDuration: '3s' }} />
          
          {/* Avatar container with spin */}
          <div 
            className="relative w-48 h-48 rounded-full p-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
            style={{ 
              animation: 'celebrationSpin 2s ease-in-out infinite',
            }}
          >
            <Avatar className="w-full h-full ring-4 ring-white">
              <AvatarImage src={vendedor.fotoUrl} alt={vendedor.nome} className="object-cover" />
              <AvatarFallback className="bg-nexttrack-green text-white text-4xl font-bold">
                {vendedor.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Stars around avatar */}
          <div className="absolute -top-4 -left-4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</div>
          <div className="absolute -top-4 -right-4 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
          <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
          <div className="absolute -bottom-4 -right-4 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</div>
        </div>

        {/* Trophy and name */}
        <div className="text-center space-y-2">
          <div className="text-6xl animate-bounce">🏆</div>
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            {vendedor.nome}
          </h2>
          <p className="text-2xl text-yellow-400 font-semibold animate-pulse">
            {message}
          </p>
        </div>

        {/* Fireworks emojis */}
        <div className="flex gap-4 text-4xl">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎆</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎇</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
          <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🎊</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎇</span>
          <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🎆</span>
        </div>
      </div>

      <style>{`
        @keyframes celebrationSpin {
          0%, 100% { transform: rotate(-10deg) scale(1); }
          25% { transform: rotate(10deg) scale(1.05); }
          50% { transform: rotate(-10deg) scale(1); }
          75% { transform: rotate(10deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
