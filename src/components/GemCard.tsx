/**
 * GemCard Component
 *
 * Card component for displaying gems in a collection grid.
 * Features rarity-based glow effects and hover animations.
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { MagicGem } from '../types/gem';
import { getRarityClass, ELEMENT_ICONS } from '../types/gem';
import { GemScene } from './GemScene';
import { RarityBadge } from './RarityBadge';
import styles from './GemCard.module.css';

interface GemCardProps {
  gem: MagicGem;
  index?: number; // For stagger animation
  className?: string;
}

export const GemCard = memo(function GemCard({
  gem,
  index = 0,
  className = '',
}: GemCardProps) {
  const gemParams = {
    shape: gem.shape,
    color: gem.color,
    turbidity: gem.turbidity,
    dispersion: 0.05,
    thickness: 1.5,
    detailLevel: 5,
  };

  return (
    <Link
      to={`/gem/${gem.id}`}
      className={`${styles.card} ${getRarityClass(gem.rarity)} ${className}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={styles.inner}>
        {/* Gem Preview */}
        <div className={styles.preview}>
          <GemScene
            params={gemParams}
            contrast={gem.contrast}
            autoRotate
            dynamicBackground
          />
        </div>

        {/* Info Section */}
        <div className={styles.info}>
          {/* Element Icon */}
          {gem.magicPower.element && (
            <span className={styles.element}>
              {ELEMENT_ICONS[gem.magicPower.element]}
            </span>
          )}

          {/* Gem Name */}
          <h3 className={styles.name}>{gem.name}</h3>

          {/* Cut Name */}
          <p className={styles.cut}>{gem.cutName}</p>

          {/* Rarity Badge */}
          <RarityBadge rarity={gem.rarity} size="sm" />
        </div>
      </div>

      {/* Glow border effect */}
      <div className={styles.glowBorder} />
    </Link>
  );
});
