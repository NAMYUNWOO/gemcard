/**
 * Arcane Gems - Single Gem Store
 *
 * Zustand store for managing a single user gem.
 * User can only have one gem at a time - new summon replaces existing.
 * Persisted to localStorage with migration from v1 (collection) to v2 (single).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MagicGem, UserInfo } from '../types/gem';

// =============================================================================
// Types
// =============================================================================

interface GemStoreState {
  // Single gem storage (null if no gem)
  currentGem: MagicGem | null;

  // Cached user info for form pre-fill convenience
  lastUserInfo: UserInfo | null;
}

interface GemStoreActions {
  // Core actions
  setGem: (gem: MagicGem) => void;   // Replaces any existing gem
  clearGem: () => void;
  getGem: () => MagicGem | null;
  hasGem: () => boolean;

  // User info persistence
  setLastUserInfo: (info: UserInfo) => void;
  getLastUserInfo: () => UserInfo | null;
}

type GemStore = GemStoreState & GemStoreActions;

// =============================================================================
// Legacy Types for Migration
// =============================================================================

interface LegacyV1State {
  gems?: MagicGem[];
  sortBy?: string;
  filterBy?: string;
}

// =============================================================================
// Store
// =============================================================================

export const useGemStore = create<GemStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentGem: null,
      lastUserInfo: null,

      // Actions
      setGem: (gem) => set({ currentGem: gem }),

      clearGem: () => set({ currentGem: null }),

      getGem: () => get().currentGem,

      hasGem: () => get().currentGem !== null,

      setLastUserInfo: (info) => set({ lastUserInfo: info }),

      getLastUserInfo: () => get().lastUserInfo,
    }),
    {
      name: 'arcane-gems-collection',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migration from v1 (collection array) to v2 (single gem)
          const old = persistedState as LegacyV1State;
          const firstGem = old.gems?.[0] ?? null;

          console.log(
            `[GemStore] Migrating from v1 to v2. Preserving ${firstGem ? 'first gem' : 'no gem'}.`
          );

          return {
            currentGem: firstGem,
            lastUserInfo: null,
          } as GemStoreState;
        }
        return persistedState as GemStoreState;
      },
    }
  )
);
