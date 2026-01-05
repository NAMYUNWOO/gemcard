# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arcane Gems is a React + TypeScript + Vite web application featuring a single-gem-per-user system with 3D visualization using Three.js. Users input personal info and summon a mystical gem - each user can only possess one gem at a time.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Core Routes
- `/` - Home page (displays current gem or prompts to summon)
- `/summon` - Summoning page (user info form + gem generation)
- `/gem/:id` - Gem detail view

### Legacy Routes (redirects)
- `/gacha` → `/summon`
- `/collection` → `/`
- `/create` → `/summon`

### Key Directories
- `src/components/` - Reusable React components (GemScene, GemCard, MagicButton, etc.)
- `src/pages/` - Route-level page components (Home, Gacha, GemDetail)
- `src/stores/` - Zustand state management (persisted to localStorage)
- `src/types/` - TypeScript definitions for gem system
- `src/utils/` - Gem generation, GemCad geometry loading
- `src/shaders/` - Three.js vertex/fragment shaders for gem rendering
- `public/gem_cads/` - ~2000 GemCad .asc geometry files
- `public/magiccircle/` - Magic circle SVG graphics (circle-17 to circle-20)

### State Management
`useGemStore` (Zustand) - Single gem storage persisted to localStorage as 'arcane-gems-collection' (v2)
- `currentGem: MagicGem | null` - User's single gem
- `lastUserInfo: UserInfo | null` - Cached user info for form pre-fill

### Single-Gem System
- User can only own ONE gem at a time
- New summon replaces existing gem (with confirmation)
- User must input at least one personal info field before summoning:
  - Name (optional)
  - Gender (optional)
  - Birth date (optional)
  - Birth time: hour/minute/second (optional)
- User info is stored with gem but does NOT affect generation

### 3D Rendering Pipeline
`GemScene` → `GemBackground` (canvas texture) → Three.js with custom shaders
- Custom gem shaders in `src/shaders/`
- GemCad parser loads .asc files into Three.js BufferGeometry
- `useDragRotation` hook handles mouse/touch rotation
- Pinch-to-zoom on mobile, Ctrl/Cmd+scroll on desktop

### Gem System
- **Rarity**: common (50%), uncommon (30%), rare (15%), epic (4%), legendary (1%)
- **Elements**: fire, water, earth, wind, light, darkness, spirit, mind
- **Magic Circles**: 4 types (IDs 17-20) randomly assigned
- **Colors**: Random hex codes (HSL-based for vibrant distribution)

### Generation Flow
`generateMagicGem(origin, userInfo?)` → rolls rarity → selects template from `sampleGems.ts` → generates random hex color → generates visual params → assigns random magic circle → returns MagicGem with userInfo

## Tech Stack
- React 19 + React Router DOM 7
- TypeScript 5.9 (strict mode)
- Vite 7.2
- Three.js 0.182
- Zustand 5 (localStorage persistence with migration support)
- CSS Modules for component styling
