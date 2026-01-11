# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arcane Gems** is a React + TypeScript + Vite web application featuring a single-gem-per-user mystical gem summoning system with 3D visualization using Three.js. Users input personal info (name, gender, birthdate) and summon a unique magical gem. Each user can only possess one gem at a time - summoning a new gem replaces the previous one.

## Commands

```bash
npm run dev           # Start Vite dev server with HMR (http://localhost:5173)
npm run build         # TypeScript compile + Vite production build
npm run lint          # Run ESLint on TypeScript files
npm run preview       # Preview production build locally
npm run prebuild-gems # Pre-build gem geometries to binary format
```

## Architecture

### Route Structure

**Core Routes:**
- `/` - Home page (displays current gem or prompts to summon)
- `/summon` - Summoning page (user info form + gem generation)
- `/gem/:id` - Gem detail view with share functionality
- `/share/:data` - Shared gem view (compressed gem data in URL)

**Legacy Routes (redirect to new structure):**
- `/gacha` → `/summon`
- `/collection` → `/`
- `/create` → `/summon`

### Directory Structure

```
src/
├── components/          # Reusable React components
│   ├── GemScene/        # 3D gem renderer (Three.js)
│   ├── GemBackground.tsx # Dynamic canvas texture for gem background
│   ├── GemCard.tsx      # Gem display card component
│   ├── MagicButton.tsx  # Styled action buttons
│   ├── ParticleSpoiler.tsx # Tap-to-reveal spoiler effect
│   ├── RarityBadge.tsx  # Rarity indicator badge
│   ├── StarField.tsx    # Animated star background
│   └── SummonCircle.tsx # Magic circle animation
├── constants/           # Application constants
│   └── gem.ts           # Rendering constants (camera, animation, etc.)
├── data/                # Static data
│   ├── sampleGems.ts    # Gem template database (auto-generated from CSV)
│   └── SAMPLE_GEM_TEMPLATES_new.csv # Source CSV for templates
├── hooks/               # Custom React hooks
│   ├── useDragRotation.ts # Mouse/touch rotation for 3D gems
│   ├── useLocale.ts     # Locale detection and management
│   └── useRevealAction.ts # Tap-to-reveal action handler
├── pages/               # Route-level page components
│   ├── Home.tsx         # Landing page
│   ├── Gacha.tsx        # Summoning flow (form → animation → reveal)
│   ├── GemDetail.tsx    # Single gem detail view
│   └── SharedGem.tsx    # Shared gem viewer
├── shaders/             # GLSL shaders for gem rendering
│   ├── gem.vert.ts      # Vertex shader
│   └── gem.frag.ts      # Fragment shader (refraction, dispersion)
├── stores/              # State management (Zustand)
│   ├── gemStore.ts      # Single-gem state (persisted)
│   └── cardStore.ts     # GemCard state for sharing
├── styles/              # Global CSS
│   ├── animations.css   # Keyframe animations
│   └── variables.css    # CSS custom properties
├── types/               # TypeScript definitions
│   ├── gem.ts           # Core gem types + magic system
│   ├── card.ts          # GemCard types + GemCad utilities
│   └── unishox2.d.ts    # Compression library types
└── utils/               # Utility functions
    ├── gemGenerator.ts  # Gem generation logic
    ├── gemcadLoader.ts  # GemCad geometry loading + caching
    ├── gemcadParser.ts  # .asc file parsing to Three.js geometry
    ├── gemShare.ts      # URL encoding/decoding for sharing
    └── compression.ts   # Unishox2 compression utilities

public/
├── gem_cads/            # ~2000 GemCad .asc geometry files
│   └── index.json       # List of available shapes
├── gem_geometry/        # Pre-built binary geometries (optional)
├── magiccircle/         # Magic circle SVG assets
│   └── circles2/        # circle-17.svg to circle-20.svg (active set)
└── fonts/               # NEXON Warhaven font files

scripts/
├── convert-csv-to-ts.py # Converts CSV templates to sampleGems.ts
├── prebuild-gems.mjs    # Pre-builds gem geometry binaries
├── center-svg*.cjs      # SVG centering utilities
└── split-svg*.cjs       # SVG splitting utilities
```

## State Management

### `useGemStore` (Zustand with localStorage persistence)
- **Storage key:** `'arcane-gems-collection'` (version 2)
- **State:**
  - `currentGem: MagicGem | null` - User's single gem
  - `lastUserInfo: UserInfo | null` - Cached form data for pre-fill
  - `powerDescRevealed: boolean` - Spoiler reveal state
- **Migration:** Automatic v1 (array) → v2 (single gem) migration

### `useCardStore` (React hook with localStorage)
- **Storage key:** `'gemcard:cards'`
- Manages GemCard instances for the sharing feature

## Core Systems

### Single-Gem System
- User can only own ONE gem at a time
- New summon replaces existing gem (with confirmation dialog)
- At least one personal info field required before summoning:
  - Name (optional)
  - Gender: male, female, other, prefer-not-to-say (optional)
  - Birth date: YYYY-MM-DD (optional)
  - Birth time: hour/minute/second (optional)
- User info is stored with gem but does NOT affect generation algorithm

### Rarity System
| Rarity    | Chance |
|-----------|--------|
| Common    | 50%    |
| Uncommon  | 30%    |
| Rare      | 15%    |
| Epic      | 4%     |
| Legendary | 1%     |

### Element System
8 elements: `fire`, `water`, `earth`, `wind`, `light`, `darkness`, `spirit`, `mind`

### Magic Circles
4 circle types (IDs 17-20) randomly assigned from `MAGIC_CIRCLES` in `src/types/gem.ts`

### Gem Generation Flow
```
generateMagicGem(origin, userInfo?)
  → rollRarity() based on probability
  → getTemplateByRarity() from sampleGems.ts
  → generateVisualParams() (random shape from gem_cads)
  → getElementColor() for color
  → getRandomMagicCircle()
  → return MagicGem with all properties
```

## 3D Rendering Pipeline

### Component Hierarchy
```
GemScene (main container)
├── GemBackground (offscreen canvas → texture)
│   └── Magic circle SVG + gradient background
└── Three.js Scene
    └── Gem Mesh (custom shader material)
```

### Geometry Loading (gemcadLoader.ts)
1. Check in-memory cache
2. Try pre-built binary (`/gem_geometry/{shape}.bin`)
3. Fall back to parsing `.asc` file
4. Cache result for future use

### Shader System
- Custom vertex/fragment shaders in `src/shaders/`
- Simulates gem refraction, dispersion, and internal reflections
- Key uniforms: `uColor`, `uTurbidity`, `uContrast`, `uTime`, `uLightPos`

### Interaction
- `useDragRotation` hook: mouse drag and touch rotation
- Pinch-to-zoom on mobile, Ctrl/Cmd+scroll on desktop
- Auto-rotation when not dragging
- Floating animation (sine wave on Y-axis)

## Sharing System

### URL Encoding (gemShare.ts)
- Uses Unishox2 compression for short URLs
- Compact JSON format with single-letter keys
- URL-safe Base64 encoding
- Route: `/share/:data`

### Share Flow
```
MagicGem → encodeGemToUrl() → CompactGemData (JSON)
  → Unishox2 compress → URL-safe Base64 → /share/{data}
```

## Localization

Supported locales: `ko` (default), `en`, `zh`, `ja`, `es`

Magic power descriptions support multiple languages via `LocalizedDescriptions` interface. Use `getLocalizedDescription(magicPower, locale)` to retrieve.

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2 | UI framework |
| React Router DOM | 7.11 | Routing |
| TypeScript | 5.9 | Type safety (strict mode) |
| Vite | 7.2 | Build tool + dev server |
| Three.js | 0.182 | 3D rendering |
| three-bvh-csg | 0.0.17 | CSG operations for gem geometry |
| Zustand | 5.0.9 | State management |
| nanoid | 5.1.6 | ID generation |
| unishox2 | 1.1.5 | URL compression |
| html2canvas | 1.4.1 | Screenshot capture |
| react-colorful | 5.6.1 | Color picker |

## Development Conventions

### File Naming
- Components: PascalCase (`GemScene.tsx`)
- Hooks: camelCase with `use` prefix (`useDragRotation.ts`)
- Styles: CSS Modules (`Component.module.css`)
- Types: camelCase (`gem.ts`)

### Component Patterns
- Functional components with hooks
- CSS Modules for scoped styling
- Props interfaces defined inline or in types/

### Type Safety
- Strict mode enabled
- Use `type` imports for type-only imports
- Prefer explicit return types for complex functions

### State Updates
- Mark todos as completed immediately after finishing
- Use Zustand selectors for performance
- Persist critical state to localStorage

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/types/gem.ts` | Core type definitions, rarity/element constants |
| `src/utils/gemGenerator.ts` | Gem generation algorithm |
| `src/components/GemScene/index.tsx` | 3D rendering component |
| `src/stores/gemStore.ts` | Main application state |
| `src/data/sampleGems.ts` | Gem template database (don't edit manually) |
| `src/constants/gem.ts` | Rendering constants |

## Notes for AI Assistants

- The `sampleGems.ts` file is auto-generated from CSV. Edit the CSV and run `scripts/convert-csv-to-ts.py` instead.
- GemCad `.asc` files are industry-standard gem design files. The parser is in `gemcadParser.ts`.
- Pre-built geometry binaries (`.bin`) are optional but improve load performance.
- The magic circle IDs 17-20 correspond to SVG files in `public/magiccircle/circles2/`.
- CSS uses custom properties defined in `src/styles/variables.css`.
