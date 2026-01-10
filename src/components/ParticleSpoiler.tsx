/**
 * ParticleSpoiler Component
 *
 * Canvas-based spoiler effect with animated particles.
 * Works on all browsers including iOS Safari.
 */

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { useLocale } from '../hooks';
import type { SupportedLocale } from '../types/gem';
import styles from './ParticleSpoiler.module.css';

// Localized hint text
const HINT_TEXT: Record<SupportedLocale, string> = {
  en: 'Tap to reveal',
  ko: '터치하여 확인',
  zh: '点击查看',
  ja: 'タップして表示',
  es: 'Toca para revelar',
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ParticleSpoilerProps {
  hidden: boolean;
  onClick?: () => void;
  children: ReactNode;
  particleColor?: string;
  density?: number;
}

function createParticle(width: number, height: number): Particle {
  const maxLife = 30 + Math.random() * 60;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: 1 + Math.random() * 2,
    alpha: 0.8,
    life: Math.random() * maxLife,
    maxLife,
  };
}

export function ParticleSpoiler({
  hidden,
  onClick,
  children,
  particleColor = '#888888',
  density = 0.15,
}: ParticleSpoilerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const locale = useLocale();
  const hintText = HINT_TEXT[locale];

  // Measure container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Particle animation
  useEffect(() => {
    if (!hidden || !canvasRef.current || dimensions.width === 0) {
      // Clean up animation when not hidden
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Create particles
    const particleCount = Math.max(
      20,
      Math.floor((dimensions.width * dimensions.height * density) / 100)
    );
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(dimensions.width, dimensions.height)
    );

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      particlesRef.current.forEach((p) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = (p.life / p.maxLife) * 0.8;

        // Wrap around edges
        if (p.x < 0) p.x = dimensions.width;
        if (p.x > dimensions.width) p.x = 0;
        if (p.y < 0) p.y = dimensions.height;
        if (p.y > dimensions.height) p.y = 0;

        // Respawn when life ends
        if (p.life <= 0) {
          Object.assign(p, createParticle(dimensions.width, dimensions.height));
        }

        // Draw particle
        ctx.beginPath();
        const alphaHex = Math.floor(p.alpha * 255)
          .toString(16)
          .padStart(2, '0');
        ctx.fillStyle = `${particleColor}${alphaHex}`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [hidden, dimensions, particleColor, density]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${hidden ? styles.hidden : styles.revealed}`}
      onClick={hidden ? onClick : undefined}
      role={hidden ? 'button' : undefined}
      tabIndex={hidden ? 0 : undefined}
      onKeyDown={
        hidden
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className={styles.content}>{children}</div>
      {hidden && (
        <>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{
              width: dimensions.width || '100%',
              height: dimensions.height || '100%',
            }}
          />
          {/* Mystical tap hint overlay */}
          <div className={styles.hintOverlay}>
            <div className={styles.hintIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={styles.tapIcon}
              >
                <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.6" />
                <path
                  d="M12 12v8M12 20l-2-2M12 20l2-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              </svg>
              <div className={styles.ripple} />
              <div className={styles.ripple2} />
            </div>
            <span className={styles.hintText}>{hintText}</span>
          </div>
        </>
      )}
    </div>
  );
}
