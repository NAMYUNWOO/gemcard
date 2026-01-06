/**
 * Gem Share Utilities
 *
 * Compress and encode gem data for URL sharing.
 * Uses lz-string for compression and URL-safe Base64 encoding.
 */

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { MagicGem, Rarity, Element, Gender } from '../types/gem';
import { getMagicCircleById, MAGIC_CIRCLES } from '../types/gem';

// =============================================================================
// Types
// =============================================================================

/**
 * Compact data format for URL encoding (short keys to minimize size)
 */
interface CompactGemData {
  n?: string;  // userName
  g?: number;  // gender (0-3)
  d?: string;  // birthdate (YYYYMMDD)
  t?: number;  // birthTime (seconds 0-86399)
  s: string;   // shape
  c: number;   // circleNo (17-20)
  x: string;   // color (no #)
  u: number;   // turbidity (0-100)
  k: number;   // contrast (50-100)
  r: number;   // rarity (0-4)
  m: string;   // gemName
  p: string;   // powerTitle
  q: string;   // powerDesc
  e?: number;  // element (0-7, optional)
}

// =============================================================================
// Mappings
// =============================================================================

const RARITY_TO_INDEX: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

const INDEX_TO_RARITY: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const GENDER_TO_INDEX: Record<Gender, number> = {
  male: 0,
  female: 1,
  other: 2,
  'prefer-not-to-say': 3,
};

const INDEX_TO_GENDER: Gender[] = ['male', 'female', 'other', 'prefer-not-to-say'];

const ELEMENT_TO_INDEX: Record<Element, number> = {
  fire: 0,
  water: 1,
  earth: 2,
  wind: 3,
  light: 4,
  darkness: 5,
  spirit: 6,
  mind: 7,
};

const INDEX_TO_ELEMENT: Element[] = [
  'fire', 'water', 'earth', 'wind', 'light', 'darkness', 'spirit', 'mind'
];

// =============================================================================
// Encode
// =============================================================================

/**
 * Encode a MagicGem to a compressed URL-safe string
 */
export function encodeGemToUrl(gem: MagicGem): string {
  const compact: CompactGemData = {
    s: gem.shape,
    c: gem.magicCircle.id,
    x: gem.color.replace('#', ''),
    u: Math.round(gem.turbidity * 100),
    k: Math.round(gem.contrast * 100),
    r: RARITY_TO_INDEX[gem.rarity],
    m: gem.name,
    p: gem.magicPower.title,
    q: gem.magicPower.description,
  };

  // Add optional element
  if (gem.magicPower.element) {
    compact.e = ELEMENT_TO_INDEX[gem.magicPower.element];
  }

  // Add user info if present
  if (gem.userInfo) {
    if (gem.userInfo.name) {
      compact.n = gem.userInfo.name;
    }
    if (gem.userInfo.gender) {
      compact.g = GENDER_TO_INDEX[gem.userInfo.gender];
    }
    if (gem.userInfo.birthdate) {
      // Convert YYYY-MM-DD to YYYYMMDD
      compact.d = gem.userInfo.birthdate.date.replace(/-/g, '');

      // Convert time to seconds
      if (
        gem.userInfo.birthdate.hour !== undefined ||
        gem.userInfo.birthdate.minute !== undefined ||
        gem.userInfo.birthdate.second !== undefined
      ) {
        const h = gem.userInfo.birthdate.hour ?? 0;
        const m = gem.userInfo.birthdate.minute ?? 0;
        const s = gem.userInfo.birthdate.second ?? 0;
        compact.t = h * 3600 + m * 60 + s;
      }
    }
  }

  const json = JSON.stringify(compact);
  return compressToEncodedURIComponent(json);
}

// =============================================================================
// Decode
// =============================================================================

/**
 * Decode a compressed URL string back to gem data
 * Returns null if decoding fails
 */
export function decodeGemFromUrl(encoded: string): Partial<MagicGem> | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const compact: CompactGemData = JSON.parse(json);

    // Validate required fields
    if (!compact.s || !compact.x || !compact.m || !compact.p || !compact.q) {
      return null;
    }

    // Build MagicGem
    const gem: Partial<MagicGem> = {
      shape: compact.s,
      cutName: '', // Will need to be loaded separately
      color: `#${compact.x}`,
      turbidity: compact.u / 100,
      contrast: compact.k / 100,
      rarity: INDEX_TO_RARITY[compact.r] ?? 'common',
      name: compact.m,
      magicPower: {
        title: compact.p,
        description: compact.q,
        element: compact.e !== undefined ? INDEX_TO_ELEMENT[compact.e] : undefined,
      },
      magicCircle: getMagicCircleById(compact.c) ?? MAGIC_CIRCLES[0],
    };

    // Restore user info
    if (compact.n || compact.g !== undefined || compact.d) {
      gem.userInfo = {};

      if (compact.n) {
        gem.userInfo.name = compact.n;
      }

      if (compact.g !== undefined) {
        gem.userInfo.gender = INDEX_TO_GENDER[compact.g];
      }

      if (compact.d) {
        // Convert YYYYMMDD to YYYY-MM-DD
        const date = `${compact.d.slice(0, 4)}-${compact.d.slice(4, 6)}-${compact.d.slice(6, 8)}`;
        gem.userInfo.birthdate = { date };

        // Convert seconds to time
        if (compact.t !== undefined) {
          const totalSeconds = compact.t;
          gem.userInfo.birthdate.hour = Math.floor(totalSeconds / 3600);
          gem.userInfo.birthdate.minute = Math.floor((totalSeconds % 3600) / 60);
          gem.userInfo.birthdate.second = totalSeconds % 60;
        }
      }
    }

    return gem;
  } catch {
    return null;
  }
}

/**
 * Generate full share URL
 */
export function generateShareUrl(gem: MagicGem): string {
  const encoded = encodeGemToUrl(gem);
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${encoded}`;
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareUrl(gem: MagicGem): Promise<boolean> {
  try {
    const url = generateShareUrl(gem);
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
