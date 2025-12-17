import { useState, useEffect } from 'react';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = time.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="text-right">
      <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{formattedTime}</p>
      <p className="text-[10px] text-muted-foreground capitalize">{formattedDate}</p>
    </div>
  );
}
