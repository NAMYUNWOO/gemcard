# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arcane Gems is a React + TypeScript + Vite web application featuring an interactive gem collection gacha system with 3D visualization using Three.js. Users summon mystical gems with procedurally generated properties and collect them.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Core Routes
- `/` - Collection page (gem browser with sort/filter)
- `/gacha` - Summoning page (create new gems)
- `/gem/:id` - Gem detail view

### Key Directories
- `src/components/` - Reusable React components (GemScene, GemCard, MagicButton, etc.)
- `src/pages/` - Route-level page components
- `src/stores/` - Zustand state management (persisted to localStorage)
- `src/types/` - TypeScript definitions for gem system
- `src/utils/` - Gem generation, GemCad geometry loading
- `src/shaders/` - Three.js vertex/fragment shaders for gem rendering
- `public/gem_cads/` - ~2000 GemCad .asc geometry files
- `public/magiccircle/` - Magic circle SVG graphics

### State Management
`useGemStore` (Zustand) - Gem collection persisted to localStorage as 'arcane-gems-collection'

### 3D Rendering Pipeline
`GemScene` → `GemBackground` (canvas texture) → Three.js with custom shaders
- Custom gem shaders in `src/shaders/`
- GemCad parser loads .asc files into Three.js BufferGeometry
- `useDragRotation` hook handles mouse/touch rotation

### Gem System
- **Rarity**: common (50%), uncommon (30%), rare (15%), epic (4%), legendary (1%)
- **Elements**: fire, water, earth, wind, light, darkness, spirit, mind
- **Magic Circles**: 4 types (IDs 17-20) randomly assigned

### Generation Flow
`generateMagicGem()` → rolls rarity → selects template from `sampleGems.ts` → generates visual params → assigns random magic circle → returns MagicGem

## Tech Stack
- React 19 + React Router DOM 7
- TypeScript 5.9 (strict mode)
- Vite 7.2
- Three.js 0.182
- Zustand 5 (localStorage persistence)
- CSS Modules for component styling
