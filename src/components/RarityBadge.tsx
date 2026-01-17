/**
 * RarityBadge Component
 *
 * Displays gem rarity with appropriate styling and glow effects.
 */

import { memo } from 'react';
import type { Rarity } from '../types/gem';
import { getRarityLabel } from '../types/gem';
import { useLocale } from '../hooks/useLocale';
import styles from './RarityBadge.module.css';

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RarityBadge = memo(function RarityBadge({
  rarity,
  size = 'md',
  showLabel = true,
  className = '',
}: RarityBadgeProps) {
  const locale = useLocale();

  return (
    <span
      className={`${styles.badge} ${styles[rarity]} ${styles[size]} ${className}`}
    >
      {showLabel && getRarityLabel(rarity, locale)}
    </span>
  );
});
