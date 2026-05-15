import { useEffect, useState } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  character: string;
}

interface ParticleEffectProps {
  text: string;
  startX: number;
  startY: number;
  onComplete?: () => void;
}

export function ParticleEffect({ text, startX, startY, onComplete }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create particles from each character
    const newParticles: Particle[] = text.split('').map((char, idx) => ({
      id: `${Date.now()}-${idx}`,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 1,
      character: char
    }));

    setParticles(newParticles);

    // Animate particles
    const animationFrames: number[] = [];
    let frameCount = 0;
    const maxFrames = 60;

    const animate = () => {
      frameCount++;
      
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15, // gravity
          life: p.life - 0.016,
          vx: p.vx * 0.98 // air resistance
        })).filter(p => p.life > 0);

        if (updated.length === 0 && onComplete) {
          onComplete();
        }

        return updated;
      });

      if (frameCount < maxFrames) {
        animationFrames.push(requestAnimationFrame(animate));
      }
    };

    animationFrames.push(requestAnimationFrame(animate));

    return () => {
      animationFrames.forEach(id => cancelAnimationFrame(id));
    };
  }, [text, startX, startY, onComplete]);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none text-lg font-bold"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.life * 0.8,
            transform: `translate(-50%, -50%) scale(${particle.life})`,
            transition: 'none',
            color: `hsl(200, 100%, 50%)`,
            textShadow: `0 0 8px hsl(200, 100%, 50%, ${particle.life * 0.6})`,
            zIndex: 999
          }}
        >
          {particle.character}
        </div>
      ))}
    </>
  );
}
