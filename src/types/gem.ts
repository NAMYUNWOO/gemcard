/**
 * Arcane Gems - Type Definitions
 */

// =============================================================================
// Rarity System
// =============================================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_CHANCES: Record<Rarity, number> = {
  common: 0.50,
  uncommon: 0.30,
  rare: 0.15,
  epic: 0.04,
  legendary: 0.01,
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// =============================================================================
// Element System
// =============================================================================

export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'darkness' | 'spirit' | 'mind';

export const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  wind: '💨',
  light: '✨',
  darkness: '🌑',
  spirit: '👻',
  mind: '🧠',
};

export const ELEMENT_LABELS: Record<Element, string> = {
  fire: 'Fire',
  water: 'Water',
  earth: 'Earth',
  wind: 'Wind',
  light: 'Light',
  darkness: 'Darkness',
  spirit: 'Spirit',
  mind: 'Mind',
};

// =============================================================================
// Magic Power
// =============================================================================

export interface MagicPower {
  title: string;
  description: string;
  element?: Element;
}

// =============================================================================
// Magic Gem
// =============================================================================

export type GemOrigin = 'gacha' | 'exchange' | 'gift';

export interface MagicGem {
  id: string;

  // Visual properties (compatible with existing GemScene)
  shape: string;      // GemCad file name
  cutName: string;    // Cut name (e.g., "Standard Brilliant")
  color: string;      // Hex color
  turbidity: number;  // Opacity 0~1
  contrast: number;   // Internal contrast 0.5~1

  // Magic properties
  name: string;           // Gem name (e.g., "Tear of the Moon Goddess")
  magicPower: MagicPower;
  rarity: Rarity;

  // Metadata
  obtainedAt: number;  // Timestamp
  origin: GemOrigin;
}

// =============================================================================
// Sample Gem Template (for generation)
// =============================================================================

export interface SampleGemTemplate {
  name: string;
  magicPower: MagicPower;
  rarity: Rarity;
}

// =============================================================================
// Utility Types
// =============================================================================

export type GemVisualParams = Pick<MagicGem, 'shape' | 'color' | 'turbidity' | 'contrast'>;

export function getRarityClass(rarity: Rarity): string {
  return `rarity-${rarity}`;
}
