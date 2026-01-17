/**
 * Gem Share Utilities
 *
 * Compress and encode gem data for URL sharing.
 * Uses Unishox2 for compression (optimized for short strings).
 */

import {
  unishox2_compress_simple,
  unishox2_decompress_simple,
} from 'unishox2.siara.cc';
import type { MagicGem, Rarity, Element, Gender } from '../types/gem';
import { getMagicCircleById, MAGIC_CIRCLES } from '../types/gem';
import { SAMPLE_GEM_TEMPLATES } from '../data/sampleGems';

// =============================================================================
// Types
// =============================================================================

/**
 * Compact data format for URL encoding (short keys to minimize size)
 *
 * For new gems with templateIndex:
 *   - i: templateIndex (0-N) - restores name, rarity, magicPower from template
 *   - Only visual properties (s, c, x, u, k) and user info are stored
 *
 * For backward compatibility (legacy gems without templateIndex):
 *   - m, p, q, e, r: full gem text data
 */
interface CompactGemData {
  // Template-based encoding (new, much shorter URL)
  i?: number;  // templateIndex - if present, restores name/power/rarity from template

  // User info (optional)
  n?: string;  // userName
  g?: number;  // gender (0-3)
  d?: string;  // birthdate (YYYYMMDD)
  t?: number;  // birthTime (seconds 0-86399)

  // Visual properties (always required)
  s: string;   // shape
  c: number;   // circleNo (17-20)
  x: string;   // color (no #)
  u: number;   // turbidity (0-100)
  k: number;   // contrast (50-100)

  // Legacy fields (for backward compatibility - only used when i is not present)
  r?: number;  // rarity (0-4)
  m?: string;  // gemName
  p?: string;  // powerTitle
  q?: string;  // powerDesc
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
// URL-safe Base64 Helpers
// =============================================================================

/**
 * Convert Uint8Array to URL-safe Base64 string
 */
function uint8ArrayToUrlSafeBase64(bytes: Uint8Array, length: number): string {
  let binary = '';
  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Standard Base64 → URL-safe Base64
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert URL-safe Base64 string to Uint8Array
 */
function urlSafeBase64ToUint8Array(base64: string): Uint8Array {
  // URL-safe Base64 → Standard Base64
  let standardBase64 = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding if needed
  while (standardBase64.length % 4) {
    standardBase64 += '=';
  }

  const binary = atob(standardBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// =============================================================================
// Encode
// =============================================================================

/**
 * Encode a MagicGem to a compressed URL-safe string
 *
 * If gem has templateIndex, uses template-based encoding (much shorter URL).
 * Otherwise, falls back to legacy encoding with full text data.
 */
export function encodeGemToUrl(gem: MagicGem): string {
  // Visual properties (always required)
  const compact: CompactGemData = {
    s: gem.shape,
    c: gem.magicCircle.id,
    x: gem.color.replace('#', ''),
    u: Math.round(gem.turbidity * 100),
    k: Math.round(gem.contrast * 100),
  };

  // Use template index if available (much shorter URL)
  if (gem.templateIndex !== undefined) {
    compact.i = gem.templateIndex;
    // No need to store m, p, q, e, r - they can be restored from template
  } else {
    // Legacy encoding: store full text data
    compact.r = RARITY_TO_INDEX[gem.rarity];
    compact.m = gem.name;
    compact.p = gem.magicPower.title;
    compact.q = gem.magicPower.description;

    // Add optional element
    if (gem.magicPower.element) {
      compact.e = ELEMENT_TO_INDEX[gem.magicPower.element];
    }
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

  // Compress with Unishox2
  const outBuf = new Uint8Array(json.length * 2); // Buffer for compressed data
  const compressedLen = unishox2_compress_simple(json, json.length, outBuf);

  // Convert to URL-safe Base64
  return uint8ArrayToUrlSafeBase64(outBuf, compressedLen);
}

// =============================================================================
// Decode
// =============================================================================

/**
 * Decode a compressed URL string back to gem data
 * Returns null if decoding fails
 *
 * Supports two encoding formats:
 * 1. Template-based (new): Uses templateIndex to restore name/power/rarity from template
 * 2. Legacy: Uses full text data (m, p, q, e, r fields)
 */
export function decodeGemFromUrl(encoded: string): Partial<MagicGem> | null {
  try {
    // Decode from URL-safe Base64
    const compressedBytes = urlSafeBase64ToUint8Array(encoded);

    // Decompress with Unishox2
    const json = unishox2_decompress_simple(compressedBytes, compressedBytes.length);
    if (!json) return null;

    const compact: CompactGemData = JSON.parse(json);

    // Validate required visual fields
    if (!compact.s || !compact.x) {
      return null;
    }

    // Build MagicGem base with visual properties
    const gem: Partial<MagicGem> = {
      shape: compact.s,
      color: `#${compact.x}`,
      turbidity: compact.u / 100,
      contrast: compact.k / 100,
      magicCircle: getMagicCircleById(compact.c) ?? MAGIC_CIRCLES[0],
    };

    // Check if using template-based encoding
    if (compact.i !== undefined) {
      const template = SAMPLE_GEM_TEMPLATES[compact.i];
      if (!template) {
        return null; // Invalid template index
      }

      // Restore from template (with full localization support)
      gem.name = template.name;
      gem.names = template.names;
      gem.rarity = template.rarity;
      gem.magicPower = { ...template.magicPower };
      gem.templateIndex = compact.i;
    } else {
      // Legacy decoding: validate and use stored text data
      if (!compact.m || !compact.p || !compact.q) {
        return null;
      }

      gem.name = compact.m;
      gem.rarity = compact.r !== undefined ? (INDEX_TO_RARITY[compact.r] ?? 'common') : 'common';
      gem.magicPower = {
        title: compact.p,
        description: compact.q,
        element: compact.e !== undefined ? INDEX_TO_ELEMENT[compact.e] : undefined,
      };
    }

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
