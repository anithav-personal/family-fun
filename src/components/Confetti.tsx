import { useEffect, useState } from 'react';

const EMOJIS = ['🌟', '⭐', '💫', '✨', '🎉', '🎊', '🪙', '💰', '🏆', '🎈', '🍭', '🌈'];
const COUNT = 20;

interface Particle {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

interface Props {
  message: string;
  coins: number;
  onDone: () => void;
}

export default function Confetti({ message, coins, onDone }: Props) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: 4 + ((i / COUNT) * 90) + (Math.random() * 6 - 3),
      duration: 1.1 + Math.random() * 0.9,
      delay: Math.random() * 0.9,
      size: 20 + Math.floor(Math.random() * 22),
    })),
  );

  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="celebration-overlay"
      onClick={onDone}
      role="dialog"
      aria-modal="true"
      aria-label="Celebration"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          aria-hidden="true"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <div className="celebration-card">
        <div className="celebration-emoji">🎉</div>
        <div className="celebration-message">{message}</div>
        {coins > 0 && <div className="celebration-coins">+{coins} 🪙</div>}
        <div className="celebration-hint">Tap to continue</div>
      </div>
    </div>
  );
}
