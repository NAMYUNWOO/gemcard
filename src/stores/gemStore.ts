/**
 * Arcane Gems - Multi-Slot Gem Store (v3)
 *
 * Zustand store for managing multiple gem slots.
 * Users can have multiple gems (based on purchased slots).
 * Free tier: 1 slot, Premium: up to 10 slots.
 *
 * Persisted to localStorage with migration from:
 * - v1 (collection array) → v3 (multi-slot)
 * - v2 (single gem) → v3 (multi-slot)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MagicGem, UserInfo } from '../types/gem';
import { STORAGE_CONSTANTS } from '../services/storage/types';

// =============================================================================
// Types
// =============================================================================

interface GemStoreState {
  // Multi-slot storage
  gems: Record<number, MagicGem>; // slot -> gem
  activeSlot: number;
  maxSlots: number;
  packsPurchased: number;

  // Backward compatibility alias (computed from activeSlot)
  currentGem: MagicGem | null;

  // Cached user info for form pre-fill convenience
  lastUserInfo: UserInfo | null;

  // Whether the power description spoiler has been revealed
  powerDescRevealed: boolean;
}

interface GemStoreActions {
  // Core actions (backward compatible)
  setGem: (gem: MagicGem) => void; // Sets gem at first available slot or replaces active
  clearGem: () => void; // Clears active gem
  getGem: () => MagicGem | null; // Gets active gem
  hasGem: () => boolean; // Checks if any gem exists

  // Multi-slot actions
  setGemAtSlot: (gem: MagicGem, slot: number) => void;
  deleteGemAtSlot: (slot: number) => void;
  setActiveSlot: (slot: number) => void;
  getGemAtSlot: (slot: number) => MagicGem | null;
  getAllGems: () => MagicGem[];
  getAvailableSlot: () => number | null;
  getGemCount: () => number;

  // Slot management
  setMaxSlots: (slots: number) => void;
  setPacksPurchased: (count: number) => void;

  // User info persistence
  setLastUserInfo: (info: UserInfo) => void;
  getLastUserInfo: () => UserInfo | null;

  // Spoiler reveal state
  setPowerDescRevealed: (revealed: boolean) => void;
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

interface LegacyV2State {
  currentGem?: MagicGem | null;
  lastUserInfo?: UserInfo | null;
  powerDescRevealed?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert gems object to currentGem (active slot gem)
 */
function getCurrentGem(gems: Record<number, MagicGem>, activeSlot: number): MagicGem | null {
  return gems[activeSlot] ?? null;
}

// =============================================================================
// Store
// =============================================================================

export const useGemStore = create<GemStore>()(
  persist(
    (set, get) => ({
      // Initial State
      gems: {},
      activeSlot: 0,
      maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
      packsPurchased: 0,
      currentGem: null,
      lastUserInfo: null,
      powerDescRevealed: false,

      // =============================================================================
      // Core Actions (Backward Compatible)
      // =============================================================================

      setGem: (gem) => {
        const state = get();

        // Find first available slot or use active slot if no empty slots
        let targetSlot = state.getAvailableSlot();
        if (targetSlot === null) {
          // All slots full, replace active slot
          targetSlot = state.activeSlot;
        }

        set({
          gems: { ...state.gems, [targetSlot]: gem },
          activeSlot: targetSlot,
          currentGem: gem,
          powerDescRevealed: false,
        });
      },

      clearGem: () => {
        const state = get();
        const newGems = { ...state.gems };
        delete newGems[state.activeSlot];

        // Update currentGem to null if we just deleted the active gem
        set({
          gems: newGems,
          currentGem: null,
        });
      },

      getGem: () => get().currentGem,

      hasGem: () => Object.keys(get().gems).length > 0,

      // =============================================================================
      // Multi-Slot Actions
      // =============================================================================

      setGemAtSlot: (gem, slot) => {
        const state = get();

        if (slot < 0 || slot >= state.maxSlots) {
          console.warn(`[GemStore] Invalid slot: ${slot}. Max: ${state.maxSlots}`);
          return;
        }

        const newGems = { ...state.gems, [slot]: gem };
        set({
          gems: newGems,
          activeSlot: slot,
          currentGem: gem,
          powerDescRevealed: false,
        });
      },

      deleteGemAtSlot: (slot) => {
        const state = get();
        const newGems = { ...state.gems };
        delete newGems[slot];

        // If we deleted the active slot gem, update currentGem
        const newCurrentGem = slot === state.activeSlot ? null : state.currentGem;

        set({
          gems: newGems,
          currentGem: newCurrentGem,
        });
      },

      setActiveSlot: (slot) => {
        const state = get();

        if (slot < 0 || slot >= state.maxSlots) {
          console.warn(`[GemStore] Invalid slot: ${slot}. Max: ${state.maxSlots}`);
          return;
        }

        set({
          activeSlot: slot,
          currentGem: state.gems[slot] ?? null,
        });
      },

      getGemAtSlot: (slot) => get().gems[slot] ?? null,

      getAllGems: () => Object.values(get().gems),

      getAvailableSlot: () => {
        const state = get();
        for (let i = 0; i < state.maxSlots; i++) {
          if (!state.gems[i]) {
            return i;
          }
        }
        return null;
      },

      getGemCount: () => Object.keys(get().gems).length,

      // =============================================================================
      // Slot Management
      // =============================================================================

      setMaxSlots: (slots) => {
        set({
          maxSlots: Math.min(
            Math.max(slots, STORAGE_CONSTANTS.BASE_SLOTS),
            STORAGE_CONSTANTS.MAX_SLOTS
          ),
        });
      },

      setPacksPurchased: (count) => {
        set({
          packsPurchased: Math.min(
            Math.max(count, 0),
            STORAGE_CONSTANTS.MAX_PACK_PURCHASES
          ),
        });
      },

      // =============================================================================
      // User Info
      // =============================================================================

      setLastUserInfo: (info) => set({ lastUserInfo: info }),

      getLastUserInfo: () => get().lastUserInfo,

      // =============================================================================
      // Spoiler State
      // =============================================================================

      setPowerDescRevealed: (revealed) => set({ powerDescRevealed: revealed }),
    }),
    {
      name: 'arcane-gems-collection',
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migration from v1 (collection array) to v3 (multi-slot)
          const old = persistedState as LegacyV1State;
          const firstGem = old.gems?.[0] ?? null;

          console.log(
            `[GemStore] Migrating from v1 to v3. Preserving ${firstGem ? 'first gem' : 'no gem'}.`
          );

          const gems: Record<number, MagicGem> = {};
          if (firstGem) {
            gems[0] = firstGem;
          }

          return {
            gems,
            activeSlot: 0,
            maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
            packsPurchased: 0,
            currentGem: firstGem,
            lastUserInfo: null,
            powerDescRevealed: false,
          } as GemStoreState;
        }

        if (version === 2) {
          // Migration from v2 (single gem) to v3 (multi-slot)
          const old = persistedState as LegacyV2State;

          console.log(
            `[GemStore] Migrating from v2 to v3. Preserving ${old.currentGem ? 'current gem' : 'no gem'}.`
          );

          const gems: Record<number, MagicGem> = {};
          if (old.currentGem) {
            gems[0] = old.currentGem;
          }

          return {
            gems,
            activeSlot: 0,
            maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
            packsPurchased: 0,
            currentGem: old.currentGem ?? null,
            lastUserInfo: old.lastUserInfo ?? null,
            powerDescRevealed: old.powerDescRevealed ?? false,
          } as GemStoreState;
        }

        // v3 or newer - ensure currentGem is computed correctly
        const state = persistedState as GemStoreState;
        return {
          ...state,
          currentGem: getCurrentGem(state.gems ?? {}, state.activeSlot ?? 0),
        };
      },
    }
  )
);
