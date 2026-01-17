/**
 * Arcane Gems - Gem Generator
 *
 * Utilities for generating random magic gems.
 */

import { SAMPLE_GEM_TEMPLATES, getElementColor } from '../data/sampleGems';
import { loadGemCadList, type GemShape } from '../types/card';
import type { GemOrigin, MagicGem, Rarity, UserInfo } from '../types/gem';
import { RARITY_CHANCES, RARITY_ORDER, getRandomMagicCircle } from '../types/gem';

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
 * Returns both the template and its index in SAMPLE_GEM_TEMPLATES
 * @param rarity - Target rarity for the template
 * @param excludeIndices - Set of template indices to exclude (already owned)
 */
function getTemplateByRarity(
  rarity: Rarity,
  excludeIndices?: Set<number>
): { template: (typeof SAMPLE_GEM_TEMPLATES)[0]; index: number } {
  // Filter templates by rarity with their original indices, excluding owned templates
  const matchingTemplates = SAMPLE_GEM_TEMPLATES
    .map((t, i) => ({ template: t, index: i }))
    .filter((item) =>
      item.template.rarity === rarity &&
      (!excludeIndices || !excludeIndices.has(item.index))
    );

  if (matchingTemplates.length > 0) {
    return matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
  }

  // If no match after exclusion, try without exclusion for this rarity
  const allMatchingTemplates = SAMPLE_GEM_TEMPLATES
    .map((t, i) => ({ template: t, index: i }))
    .filter((item) => item.template.rarity === rarity);

  if (allMatchingTemplates.length > 0) {
    return allMatchingTemplates[Math.floor(Math.random() * allMatchingTemplates.length)];
  }

  // If no match, find templates with lower or any rarity
  const rarityIndex = RARITY_ORDER.indexOf(rarity);

  // Try lower rarities (with exclusion first, then without)
  for (let i = rarityIndex - 1; i >= 0; i--) {
    const lowerMatches = SAMPLE_GEM_TEMPLATES
      .map((t, idx) => ({ template: t, index: idx }))
      .filter((item) =>
        item.template.rarity === RARITY_ORDER[i] &&
        (!excludeIndices || !excludeIndices.has(item.index))
      );
    if (lowerMatches.length > 0) {
      return lowerMatches[Math.floor(Math.random() * lowerMatches.length)];
    }

    // Try without exclusion
    const allLowerMatches = SAMPLE_GEM_TEMPLATES
      .map((t, idx) => ({ template: t, index: idx }))
      .filter((item) => item.template.rarity === RARITY_ORDER[i]);
    if (allLowerMatches.length > 0) {
      return allLowerMatches[Math.floor(Math.random() * allLowerMatches.length)];
    }
  }

  // Fallback to any random template
  const randomIndex = Math.floor(Math.random() * SAMPLE_GEM_TEMPLATES.length);
  return { template: SAMPLE_GEM_TEMPLATES[randomIndex], index: randomIndex };
}

/**
 * Generate random visual parameters
 */
async function generateVisualParams(): Promise<{
  shape: GemShape;
  color: string;
  turbidity: number;
  contrast: number;
}> {
  // Load available shapes
  const shapes = await loadGemCadList();
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  return {
    shape,
    color: '', // Will be set based on element
    turbidity: Math.random(), // 0.0 ~ 1.0  , other option : 0.5 ~ 1 : 0.5 + Math.random() * 0.5
    contrast: 0.5 + Math.random() * 0.5, // 0.5 ~ 1
  };
}

/**
 * Generate a new magic gem
 * @param origin - How the gem was obtained
 * @param userInfo - Optional user information to store with the gem
 * @param excludeTemplateIndices - Template indices to exclude from selection (already owned gems)
 */
export async function generateMagicGem(
  origin: GemOrigin = 'gacha',
  userInfo?: UserInfo,
  excludeTemplateIndices?: number[]
): Promise<MagicGem> {
  // Convert exclude list to Set for O(1) lookup
  const excludeSet = excludeTemplateIndices?.length
    ? new Set(excludeTemplateIndices)
    : undefined;

  // Roll for rarity
  const rarity = rollRarity();

  // Get template based on rarity (with index for efficient URL sharing)
  const { template, index: templateIndex } = getTemplateByRarity(rarity, excludeSet);

  // Generate visual params
  const visual = await generateVisualParams();

  // Generate color based on element
  const color = getElementColor(template.magicPower.element);

  // Select random magic circle
  const magicCircle = getRandomMagicCircle();

  return {
    id: generateId(),
    // Visual
    shape: visual.shape,
    color,
    turbidity: visual.turbidity,
    contrast: visual.contrast,
    // Magic
    name: template.name,
    names: template.names,
    magicPower: { ...template.magicPower },
    rarity: template.rarity,
    magicCircle,
    // Template index for efficient URL sharing
    templateIndex,
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
  const { template, index: templateIndex } = getTemplateByRarity(rarity);
  const visual = await generateVisualParams();
  const color = getElementColor(template.magicPower.element);
  const magicCircle = getRandomMagicCircle();

  return {
    id: generateId(),
    shape: visual.shape,
    color,
    turbidity: visual.turbidity,
    contrast: visual.contrast,
    name: template.name,
    names: template.names,
    magicPower: { ...template.magicPower },
    rarity: template.rarity,
    magicCircle,
    templateIndex,
    userInfo,
    obtainedAt: Date.now(),
    origin,
  };
}
