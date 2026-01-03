/**
 * Arcane Gems - Sample Magic Gem Templates
 *
 * These templates are used for gem generation.
 * Each template contains the magical properties (name, power, rarity).
 * Visual properties (shape, color, etc.) are randomly generated.
 */

import type { SampleGemTemplate, Element } from '../types/gem';

export const SAMPLE_GEM_TEMPLATES: SampleGemTemplate[] = [
  {
    name: 'Veil of Forgotten Memories',
    magicPower: {
      title: 'Memory Shroud',
      description:
        'Holding this gem allows one to revisit a single forgotten memory, though it fades again once released.',
      element: 'mind' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Ember of the First Flame',
    magicPower: {
      title: 'Primordial Spark',
      description:
        "A fragment of the universe's first fire. It never extinguishes and warms the soul in the coldest despair.",
      element: 'fire' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Tear of the Moon Goddess',
    magicPower: {
      title: 'Lunar Blessing',
      description:
        'Shed in sorrow for a mortal lover, this gem glows softly at night and grants peaceful dreams.',
      element: 'light' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Whisper of the Abyss',
    magicPower: {
      title: 'Abyssal Echo',
      description:
        'Those who listen closely hear secrets from the deep—truths better left unknown.',
      element: 'darkness' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Seed of the World Tree',
    magicPower: {
      title: "Life's Origin",
      description:
        'A crystallized seed from Yggdrasil. Plants flourish in its presence, and wounds heal faster nearby.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Frozen Sigh of Winter',
    magicPower: {
      title: 'Eternal Frost',
      description:
        'The last breath of a dying winter spirit. It preserves anything it touches in perfect, timeless ice.',
      element: 'water' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Heartstone of the Golem King',
    magicPower: {
      title: 'Unyielding Will',
      description:
        'Grants the bearer unshakable determination. No mind control or fear can break their resolve.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Compass of Lost Souls',
    magicPower: {
      title: 'Spirit Guide',
      description:
        'Points toward those who have passed on, helping the living find closure—or the dead find rest.',
      element: 'spirit' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Shard of the Shattered Sun',
    magicPower: {
      title: 'Solar Fragment',
      description:
        'A piece of a sun that exploded eons ago. It radiates warmth and reveals hidden truths in its light.',
      element: 'light' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Echo of the Storm Titan',
    magicPower: {
      title: "Thunder's Voice",
      description:
        'When struck, it releases a thunderclap that can be heard across realms, summoning aid from allies.',
      element: 'wind' as Element,
    },
    rarity: 'common',
  },
];

/**
 * Color palettes by element for random generation
 */
export const ELEMENT_COLORS: Record<Element, string[]> = {
  fire: ['#FF4500', '#FF6B35', '#FF8C00', '#DC143C', '#B22222'],
  water: ['#00CED1', '#4169E1', '#1E90FF', '#00BFFF', '#87CEEB'],
  earth: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#8FBC8F'],
  wind: ['#E0FFFF', '#B0E0E6', '#87CEFA', '#ADD8E6', '#F0FFFF'],
  light: ['#FFD700', '#FFF8DC', '#FFFACD', '#FAFAD2', '#FFFFE0'],
  darkness: ['#2F1B41', '#4A235A', '#1C1C3D', '#2C003E', '#0D0D1A'],
  spirit: ['#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2'],
  mind: ['#7B68EE', '#6A5ACD', '#483D8B', '#9370DB', '#8A2BE2'],
};

/**
 * Get a random color based on element
 */
export function getElementColor(element?: Element): string {
  if (!element) {
    // Random color from all elements
    const allColors = Object.values(ELEMENT_COLORS).flat();
    return allColors[Math.floor(Math.random() * allColors.length)];
  }
  const colors = ELEMENT_COLORS[element];
  return colors[Math.floor(Math.random() * colors.length)];
}
