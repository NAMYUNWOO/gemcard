# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arcane Gems** is a React + TypeScript + Vite web application featuring a single-gem-per-user mystical gem summoning system with 3D visualization using Three.js. Users input personal info (name, gender, birthdate) and summon a unique magical gem. Each user can only possess one gem at a time - summoning a new gem replaces the previous one.

**App in Toss (a.k.a AIT)** 
- we purpose this project to deploy in toss
- read `AIT_LLMs.md` file to create app in toss and understand what is app in toss. 
- avoid architecture design which toss does not recommend and not allow.


**check todo TASK**
- read `TASK.md`.

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
- `/` - Home page (gem storage + detail + summon modal)
- `/gem/:id` - Gem detail view with share functionality
- `/share/:data` - Shared gem view (compressed gem data in URL)

**Legacy Routes (redirect to Home):**
- `/summon` → `/`
- `/gacha` → `/`
- `/collection` → `/`
- `/create` → `/`

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
│   ├── SummonCircle.tsx # Magic circle animation
│   └── SummonModal/     # Gem summoning modal (form + animation)
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
│   ├── Home.tsx         # Main page (gem storage + summon modal)
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

### Slot Summoning State Pattern (Home.tsx)
모달에 슬롯을 전달할 때 **Zustand store 대신 로컬 React state 사용**

**문제:** Zustand의 `setActiveSlot(slot)` 호출 후 같은 이벤트 핸들러 내에서 모달을 열면, React 컴포넌트가 아직 리렌더되지 않아 `activeSlot`이 이전 값을 참조함

**해결:** `summonTargetSlot` 로컬 state 사용
```typescript
const [summonTargetSlot, setSummonTargetSlot] = useState<number>(0);

// 빈 슬롯 클릭 시
setSummonTargetSlot(slot);  // 로컬 state에 저장 (동기적)
setShowSummonModal(true);

// 모달에 전달
<SummonModal targetSlot={summonTargetSlot} ... />
```

**주의:** `activeSlot`은 현재 선택된 슬롯 표시용, `summonTargetSlot`은 소환 대상 슬롯 전달용

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
generateMagicGem(origin, userInfo?, excludeTemplateIndices?)
  → rollRarity() based on probability
  → getTemplateByRarity(rarity, excludeSet) from sampleGems.ts
    - Excludes already-owned templates from selection
    - Falls back to full pool if all templates of that rarity are owned
  → generateVisualParams() (random shape from gem_cads)
  → getElementColor() for color
  → getRandomMagicCircle()
  → return MagicGem with all properties
```

### Duplicate Prevention
- When summoning, owned gem `templateIndex` values are collected
- These indices are excluded from the template selection pool
- If all templates of a rarity are owned, duplicates are allowed (fallback)

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

## Firebase & Storage Architecture

### Environment Detection
- App in Toss WebView: `*.apps.tossmini.com`, `*.private-apps.tossmini.com`
- Non-Toss: 로컬 브라우저 환경

### Storage Strategy
| 환경 | Storage | 인증 |
|------|---------|------|
| App in Toss | Firebase Firestore | Toss 토큰 → Firebase Custom Auth |
| Non-Toss | localStorage / IndexedDB | 없음 (로컬 전용) |

### Firebase Usage Control
| 환경 | Origin 체크 | Firebase 사용 조건 |
|------|------------|-------------------|
| Production | ✓ 필수 | Toss WebView에서만 |
| Development | ✗ 선택 | `VITE_USE_FIREBASE=true` 설정 시 |

```bash
# 개발 환경에서 Firebase 테스트
VITE_USE_FIREBASE=true npm run dev
```

### Payment Model (Toss IAP)
| 상태 | 슬롯 수 | 가격 |
|------|---------|------|
| 기본 | 1개 | 무료 |
| 1회 구매 | 4개 (+3) | ₩1,000 |
| 2회 구매 | 7개 (+3) | ₩1,000 |
| 3회 구매 | 10개 (+3) | ₩1,000 |

- gem 교체: 슬롯 내 gem 삭제 후 새로 소환 → **보상형 광고 시청 필수**
- gem 캐시 한도: 슬롯 수와 동일 (1~10)

### Ads Integration (Toss Ads)
| 광고 유형 | 사용 시점 | 테스트 ID |
|----------|----------|----------|
| 보상형 광고 | gem 교체 | `ait-ad-test-rewarded-id` |

### Extended Directory Structure

```
src/
├── config/
│   └── firebase.ts              # Firebase 초기화 (환경변수 사용)
│
├── services/
│   ├── storage/
│   │   ├── types.ts             # GemStorageService 인터페이스
│   │   ├── LocalStorageService.ts   # localStorage/IndexedDB 구현
│   │   ├── FirestoreService.ts  # Firebase Firestore 구현
│   │   └── index.ts             # 팩토리 + origin 기반 서비스 선택
│   │
│   ├── auth/
│   │   └── TossAuthService.ts   # Toss 토큰 → Firebase Custom Auth
│   │
│   ├── premium/
│   │   └── PremiumService.ts    # Toss IAP 결제 처리
│   │
│   └── ads/
│       └── AdService.ts         # Toss 보상형 광고 연동
│
├── hooks/
│   ├── useStorageService.ts     # Storage 서비스 React hook
│   ├── useAuth.ts               # 인증 상태 관리 hook
│   └── usePremium.ts            # 프리미엄 상태 관리 hook
│
└── utils/
    └── environment.ts           # App in Toss 환경 감지
```

### Key Files Reference (Extended)
| 파일 | 역할 |
|------|------|
| `src/config/firebase.ts` | Firebase 초기화 |
| `src/services/storage/` | Storage 추상화 레이어 |
| `src/services/auth/TossAuthService.ts` | Toss 인증 연동 |
| `src/services/premium/PremiumService.ts` | IAP 결제 처리 |
| `src/services/ads/AdService.ts` | 보상형 광고 연동 |
| `src/utils/environment.ts` | App in Toss 감지 |

## Notes for AI Assistants

- The `sampleGems.ts` file is auto-generated from CSV. Edit the CSV and run `scripts/convert-csv-to-ts.py` instead.
- GemCad `.asc` files are industry-standard gem design files. The parser is in `gemcadParser.ts`.
- Pre-built geometry binaries (`.bin`) are optional but improve load performance.
- The magic circle IDs 17-20 correspond to SVG files in `public/magiccircle/circles2/`.
- CSS uses custom properties defined in `src/styles/variables.css`.
