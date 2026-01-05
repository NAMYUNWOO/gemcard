/**
 * Arcane Gems - Type Definitions
 */

// =============================================================================
// Magic Circle System
// =============================================================================

export interface MagicCircle {
  id: number;           // 17-20
  name: string;         // Circle name
  meaning: string;      // Circle meaning/description
}

export const MAGIC_CIRCLES: MagicCircle[] = [
  {
    id: 17,
    name: 'Sigil of the Eternal Flame',
    meaning: 'An ancient seal that channels the primordial fire of creation',
  },
  {
    id: 18,
    name: 'Seal of the Celestial Veil',
    meaning: 'A sacred pattern woven from starlight and moonbeams',
  },
  {
    id: 19,
    name: 'Glyph of the Abyssal Deep',
    meaning: 'A mysterious sigil drawn from the depths of forgotten waters',
  },
  {
    id: 20,
    name: 'Rune of the Worldtree',
    meaning: 'The mark of Yggdrasil, binding all realms together',
  },
];

export function getRandomMagicCircle(): MagicCircle {
  return MAGIC_CIRCLES[Math.floor(Math.random() * MAGIC_CIRCLES.length)];
}

export function getMagicCircleById(id: number): MagicCircle | undefined {
  return MAGIC_CIRCLES.find(c => c.id === id);
}

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
// User Info
// =============================================================================

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface BirthDateTime {
  date: string;      // YYYY-MM-DD format
  hour?: number;     // 0-23
  minute?: number;   // 0-59
  second?: number;   // 0-59
}

export interface UserInfo {
  name?: string;
  gender?: Gender;
  birthdate?: BirthDateTime;
}

/**
 * Validates that at least one field in UserInfo is filled
 */
export function isValidUserInfo(info: UserInfo): boolean {
  return !!(
    info.name?.trim() ||
    info.gender ||
    info.birthdate?.date
  );
}

export const GENDER_LABELS: Record<Gender, string> = {
  'male': 'Male',
  'female': 'Female',
  'other': 'Other',
  'prefer-not-to-say': 'Prefer not to say',
};

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
  magicCircle: MagicCircle;  // Associated magic circle

  // User info (stored with gem, doesn't affect generation)
  userInfo?: UserInfo;

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
