/**
 * Arcane Gems - Gem Generator
 *
 * Utilities for generating random magic gems.
 */

import type { MagicGem, Rarity, GemOrigin, UserInfo } from '../types/gem';
import { RARITY_CHANCES, RARITY_ORDER, getRandomMagicCircle } from '../types/gem';
import { SAMPLE_GEM_TEMPLATES } from '../data/sampleGems';
import { loadGemCadList, getCutName, type GemShape } from '../types/card';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `gem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Generate a random hex color with good saturation and brightness for gems
 * Uses HSL color space for better color distribution
 */
function generateRandomHexColor(): string {
  const hue = Math.floor(Math.random() * 360);           // 0-359 (full spectrum)
  const saturation = 60 + Math.floor(Math.random() * 40); // 60-100% (vibrant)
  const lightness = 35 + Math.floor(Math.random() * 30);  // 35-65% (not too dark/light)

  return hslToHex(hue, saturation, lightness);
}

/**
 * Roll for rarity based on probability distribution
 */
export function rollRarity(): Rarity {
  const roll = Math.random();
  let cumulative = 0;

  for (const rarity of RARITY_ORDER) {
    cumulative += RARITY_CHANCES[rarity];
    if (roll < cumulative) {
      return rarity;
    }
  }

  return 'common'; // Fallback
}

/**
 * Get a random template matching the given rarity
 * If no exact match, get closest higher rarity
 */
function getTemplateByRarity(rarity: Rarity): (typeof SAMPLE_GEM_TEMPLATES)[0] {
  // Filter templates by rarity
  const matchingTemplates = SAMPLE_GEM_TEMPLATES.filter((t) => t.rarity === rarity);

  if (matchingTemplates.length > 0) {
    return matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
  }

  // If no match, find templates with lower or any rarity
  const rarityIndex = RARITY_ORDER.indexOf(rarity);

  // Try lower rarities
  for (let i = rarityIndex - 1; i >= 0; i--) {
    const lowerMatches = SAMPLE_GEM_TEMPLATES.filter((t) => t.rarity === RARITY_ORDER[i]);
    if (lowerMatches.length > 0) {
      return lowerMatches[Math.floor(Math.random() * lowerMatches.length)];
    }
  }

  // Fallback to any random template
  return SAMPLE_GEM_TEMPLATES[Math.floor(Math.random() * SAMPLE_GEM_TEMPLATES.length)];
}

/**
 * Generate random visual parameters
 */
async function generateVisualParams(): Promise<{
  shape: GemShape;
  cutName: string;
  color: string;
  turbidity: number;
  contrast: number;
}> {
  // Load available shapes
  const shapes = await loadGemCadList();
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const cutName = await getCutName(shape);

  return {
    shape,
    cutName,
    color: '', // Will be set based on element
    turbidity: Math.random(), // 0 ~ 1
    contrast: 0.5 + Math.random() * 0.5, // 0.5 ~ 1
  };
}

/**
 * Generate a new magic gem
 * @param origin - How the gem was obtained
 * @param userInfo - Optional user information to store with the gem
 */
export async function generateMagicGem(
  origin: GemOrigin = 'gacha',
  userInfo?: UserInfo
): Promise<MagicGem> {
  // Roll for rarity
  const rarity = rollRarity();

  // Get template based on rarity
  const template = getTemplateByRarity(rarity);

  // Generate visual params
  const visual = await generateVisualParams();

  // Generate random hex color (huge variety!)
  const color = generateRandomHexColor();

  // Select random magic circle
  const magicCircle = getRandomMagicCircle();

  return {
    id: generateId(),
    // Visual
    shape: visual.shape,
    cutName: visual.cutName,
    color,
    turbidity: visual.turbidity,
    contrast: visual.contrast,
    // Magic
    name: template.name,
    magicPower: { ...template.magicPower },
    rarity: template.rarity,
    magicCircle,
    // User info (stored, doesn't affect generation)
    userInfo,
    // Metadata
    obtainedAt: Date.now(),
    origin,
  };
}

/**
 * Generate a gem with guaranteed rarity (for testing/events)
 */
export async function generateMagicGemWithRarity(
  rarity: Rarity,
  origin: GemOrigin = 'gacha',
  userInfo?: UserInfo
): Promise<MagicGem> {
  const template = getTemplateByRarity(rarity);
  const visual = await generateVisualParams();
  const color = generateRandomHexColor();
  const magicCircle = getRandomMagicCircle();

  return {
    id: generateId(),
    shape: visual.shape,
    cutName: visual.cutName,
    color,
    turbidity: visual.turbidity,
    contrast: visual.contrast,
    name: template.name,
    magicPower: { ...template.magicPower },
    rarity: template.rarity,
    magicCircle,
    userInfo,
    obtainedAt: Date.now(),
    origin,
  };
}
