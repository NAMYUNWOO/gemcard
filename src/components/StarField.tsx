/**
 * StarField Component
 *
 * Animated starfield background with twinkling stars and occasional shooting stars.
 * Pure CSS animation for performance.
 */

import { useEffect, useRef, memo } from 'react';
import styles from './StarField.module.css';

interface StarFieldProps {
  starCount?: number;
  showShootingStars?: boolean;
}

export const StarField = memo(function StarField({
  starCount = 60,
  showShootingStars = false,
}: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing stars
    container.innerHTML = '';

    // Create stars
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = styles.star;

      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      // Random size (1-3px)
      const size = 1 + Math.random() * 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Random animation duration and delay
      const duration = 2 + Math.random() * 4;
      star.style.setProperty('--twinkle-duration', `${duration}s`);
      star.style.animationDelay = `${Math.random() * duration}s`;

      container.appendChild(star);
    }

    // Create shooting stars
    if (showShootingStars) {
      for (let i = 0; i < 3; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.className = styles.shootingStar;
        shootingStar.style.top = `${Math.random() * 50}%`;
        shootingStar.style.left = `${-10 + Math.random() * 30}%`;
        shootingStar.style.setProperty('--shoot-delay', `${3 + i * 5 + Math.random() * 5}s`);
        container.appendChild(shootingStar);
      }
    }

    return () => {
      container.innerHTML = '';
    };
  }, [starCount, showShootingStars]);

  return <div ref={containerRef} className={styles.starfield} aria-hidden="true" />;
});
