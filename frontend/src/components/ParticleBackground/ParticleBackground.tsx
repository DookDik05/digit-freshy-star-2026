import { useEffect, useRef, useMemo } from 'react';
import styles from './ParticleBackground.module.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = [
  'rgba(230, 48, 18,',
  'rgba(255, 107, 26,',
  'rgba(255, 180, 50,',
  'rgba(255, 80, 20,',
];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const createParticle = useMemo(
    () =>
      (canvasWidth: number, canvasHeight: number): Particle => {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
          x: Math.random() * canvasWidth,
          y: canvasHeight + 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(Math.random() * 2 + 0.5),
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          color,
          life: 0,
          maxLife: Math.random() * 120 + 80,
        };
      },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let frameCount = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      // Spawn new particles every 3 frames
      if (frameCount % 3 === 0 && particlesRef.current.length < 80) {
        particlesRef.current.push(
          createParticle(canvas.width, canvas.height)
        );
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.vy -= 0.01; // slight upward acceleration

        const progress = p.life / p.maxLife;
        const alpha = p.opacity * (1 - progress);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha.toFixed(2)})`;
        ctx.fill();

        return p.life < p.maxLife && p.y > -10;
      });
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [createParticle]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
