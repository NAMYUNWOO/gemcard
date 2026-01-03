/**
 * MagicButton Component
 *
 * A mystical styled button with shimmer effect and glow.
 */

import { memo, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './MagicButton.module.css';

interface MagicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const MagicButton = memo(function MagicButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: MagicButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={styles.shimmer} />
      <span className={styles.content}>
        {isLoading ? (
          <span className={styles.spinner} />
        ) : (
          children
        )}
      </span>
    </button>
  );
});
