#!/usr/bin/env python3
"""
CSV to TypeScript converter for SAMPLE_GEM_TEMPLATES
Converts SAMPLE_GEM_TEMPLATES_new.csv to TypeScript format
"""

import csv
import sys
from pathlib import Path


def escape_ts_string(s: str) -> str:
    """Escape special characters for TypeScript string literals"""
    if not s:
        return ''
    # Escape backslashes first, then single quotes
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    return s


def convert_csv_to_ts(csv_path: str) -> str:
    """Convert CSV file to TypeScript SAMPLE_GEM_TEMPLATES array"""

    templates = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            name = escape_ts_string(row['Name'])
            title = escape_ts_string(row['Title'])
            # 다국어 Name
            name_ko = escape_ts_string(row.get('Name_ko', ''))
            name_zh = escape_ts_string(row.get('Name_zh', ''))
            name_ja = escape_ts_string(row.get('Name_ja', ''))
            name_es = escape_ts_string(row.get('Name_es', ''))
            # 다국어 Title
            title_ko = escape_ts_string(row.get('Title_ko', ''))
            title_zh = escape_ts_string(row.get('Title_zh', ''))
            title_ja = escape_ts_string(row.get('Title_ja', ''))
            title_es = escape_ts_string(row.get('Title_es', ''))
            # Description
            description_ko = escape_ts_string(row['Description'])
            description_en = escape_ts_string(row.get('Description_en', ''))
            description_zh = escape_ts_string(row.get('Description_zh', ''))
            description_ja = escape_ts_string(row.get('Description_ja', ''))
            description_es = escape_ts_string(row.get('Description_es', ''))
            rarity = row['Rarity'].lower().strip()
            element = row['Element'].lower().strip()

            template = f"""  {{
    name: '{name_ko}',
    names: {{
      ko: '{name_ko}',
      en: '{name}',
      zh: '{name_zh}',
      ja: '{name_ja}',
      es: '{name_es}',
    }},
    magicPower: {{
      title: '{title_ko}',
      titles: {{
        ko: '{title_ko}',
        en: '{title}',
        zh: '{title_zh}',
        ja: '{title_ja}',
        es: '{title_es}',
      }},
      description: '{description_ko}',
      descriptions: {{
        ko: '{description_ko}',
        en: '{description_en}',
        zh: '{description_zh}',
        ja: '{description_ja}',
        es: '{description_es}',
      }},
      element: '{element}' as Element,
    }},
    rarity: '{rarity}',
  }}"""
            templates.append(template)

    # Build final TypeScript file
    templates_str = ',\n'.join(templates)
    ts_content = f"""/**
 * Arcane Gems - Sample Magic Gem Templates
 *
 * These templates are used for gem generation.
 * Each template contains the magical properties (name, power, rarity).
 * Visual properties (shape, color, etc.) are randomly generated.
 *
 * AUTO-GENERATED from SAMPLE_GEM_TEMPLATES_new.csv
 * Do not edit manually - run scripts/convert-csv-to-ts.py instead
 */

import type {{ Element, SampleGemTemplate }} from '../types/gem';

export const SAMPLE_GEM_TEMPLATES: SampleGemTemplate[] = [
{templates_str},
];

/**
 * Color palettes by element for random generation
 */
export const ELEMENT_COLORS: Record<Element, string[]> = {{
  // Fire: From blazing flames to cooling embers
  fire: [
    '#FF2400', '#FF4500', '#FF8C00', '#FFD700', '#E25822', '#B22222', '#3D0C02'
  ],

  // Water: From shallow coral seas to deep ocean darkness
  water: [
    '#E0FFFF', '#7FFFD4', '#00BFFF', '#1E90FF', '#4169E1', '#000080', '#081827'
  ],

  // Earth: Lush forests, solid rocks, and minerals
  earth: [
    '#2E8B57', '#556B2F', '#8B4513', '#A0522D', '#D2691E', '#B8860B', '#3C2F2F'
  ],

  // Wind: Invisible air, storms, and atmospheric clarity
  wind: [
    '#FFFFFF', '#F5F5F5', '#AFEEEE', '#87CEEB', '#B0C4DE', '#708090', '#2F4F4F'
  ],

  // Light: Radiant glory and divine sanctity
  light: [
    '#FFFFFF', '#FFFAF0', '#F0E68C', '#FFFACD', '#FFD700', '#E6E6FA', '#FAFAD2'
  ],

  // Darkness: The void that swallows light and purple abyss
  darkness: [
    '#000000', '#0D0D1A', '#1C1C3D', '#2F1B41', '#4A235A', '#191970', '#2C3E50'
  ],

  // Spirit: Ghostly fluorescence and soul mysticism
  spirit: [
    '#ADFF2F', '#00FA9A', '#7FFFD4', '#E0B0FF', '#DA70D6', '#9370DB', '#483D8B'
  ],

  // Mind: Neural glow and psychic focus
  mind: [
    '#00FFFF', '#7DF9FF', '#120A8F', '#4B0082', '#6A5ACD', '#8A2BE2', '#E6E6FA'
  ],
}};

/**
 * Get a random color based on element
 */
export function getElementColor(element?: Element): string {{
  if (!element) {{
    // Random color from all elements
    const allColors = Object.values(ELEMENT_COLORS).flat();
    return allColors[Math.floor(Math.random() * allColors.length)];
  }}
  const colors = ELEMENT_COLORS[element];
  return colors[Math.floor(Math.random() * colors.length)];
}}
"""

    return ts_content


def main():
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    csv_path = project_root / 'src' / 'data' / 'SAMPLE_GEM_TEMPLATES_new.csv'
    output_path = project_root / 'src' / 'data' / 'sampleGems.ts'

    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}", file=sys.stderr)
        sys.exit(1)

    ts_content = convert_csv_to_ts(str(csv_path))

    # Write to output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"Successfully converted {csv_path} to {output_path}")


if __name__ == '__main__':
    main()
