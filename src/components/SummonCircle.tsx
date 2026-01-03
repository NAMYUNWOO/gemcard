/**
 * SummonCircle Component
 *
 * Mystical summoning circle for the gacha page.
 * Features rotating runic rings and pulsing geometry.
 */

import { memo } from 'react';
import styles from './SummonCircle.module.css';

interface SummonCircleProps {
  isActive?: boolean;
  isSummoning?: boolean;
  size?: number;
  className?: string;
}

// Elder Futhark runes for mystical feel
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛝᛟᛞ';

export const SummonCircle = memo(function SummonCircle({
  isActive = false,
  isSummoning = false,
  size = 300,
  className = '',
}: SummonCircleProps) {
  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ''} ${isSummoning ? styles.summoning : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 400 400" className={styles.circle}>
        {/* Definitions */}
        <defs>
          {/* Circular path for runes */}
          <path
            id="runePath"
            d="M 200,200 m -170,0 a 170,170 0 1,1 340,0 a 170,170 0 1,1 -340,0"
            fill="none"
          />
          <path
            id="innerRunePath"
            d="M 200,200 m -120,0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
            fill="none"
          />

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx="200"
          cy="200"
          r="190"
          className={styles.outerRing}
          fill="none"
          strokeWidth="2"
        />

        {/* Inner decorative ring */}
        <circle
          cx="200"
          cy="200"
          r="175"
          className={styles.decorRing}
          fill="none"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* Rotating outer runes */}
        <g className={styles.runeRingOuter}>
          <text className={styles.runeText} filter="url(#glow)">
            <textPath href="#runePath" startOffset="0%">
              {RUNES}
            </textPath>
          </text>
        </g>

        {/* Counter-rotating inner runes */}
        <g className={styles.runeRingInner}>
          <text className={styles.runeTextInner} filter="url(#glow)">
            <textPath href="#innerRunePath" startOffset="0%">
              {RUNES.split('').reverse().join('')}
            </textPath>
          </text>
        </g>

        {/* Hexagram */}
        <g className={styles.hexagram}>
          {/* Triangle pointing up */}
          <polygon
            points="200,80 280,200 120,200"
            className={styles.triangle}
            fill="none"
            strokeWidth="1.5"
          />
          {/* Triangle pointing down */}
          <polygon
            points="200,320 280,200 120,200"
            className={styles.triangle}
            fill="none"
            strokeWidth="1.5"
          />
        </g>

        {/* Inner circle */}
        <circle
          cx="200"
          cy="200"
          r="60"
          className={styles.innerCircle}
          fill="none"
          strokeWidth="2"
        />

        {/* Center glow */}
        <circle cx="200" cy="200" r="40" className={styles.centerGlow} />

        {/* Corner ornaments */}
        {[0, 90, 180, 270].map((angle) => (
          <g
            key={angle}
            transform={`rotate(${angle} 200 200)`}
            className={styles.ornament}
          >
            <circle cx="200" cy="20" r="4" />
          </g>
        ))}
      </svg>
    </div>
  );
});
