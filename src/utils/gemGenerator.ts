/**
 * Arcane Gems - Gem Generator
 *
 * Utilities for generating random magic gems.
 */

import type { MagicGem, Rarity, GemOrigin } from '../types/gem';
import { RARITY_CHANCES, RARITY_ORDER } from '../types/gem';
import { SAMPLE_GEM_TEMPLATES, getElementColor } from '../data/sampleGems';
import { loadGemCadList, getCutName, type GemShape } from '../types/card';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `gem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
 */
export async function generateMagicGem(
  origin: GemOrigin = 'gacha'
): Promise<MagicGem> {
  // Roll for rarity
  const rarity = rollRarity();

  // Get template based on rarity
  const template = getTemplateByRarity(rarity);

  // Generate visual params
  const visual = await generateVisualParams();

  // Set color based on element
  const color = getElementColor(template.magicPower.element);

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
    rarity: template.rarity, // Use template's actual rarity
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
  origin: GemOrigin = 'gacha'
): Promise<MagicGem> {
  const template = getTemplateByRarity(rarity);
  const visual = await generateVisualParams();
  const color = getElementColor(template.magicPower.element);

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
    obtainedAt: Date.now(),
    origin,
  };
}
