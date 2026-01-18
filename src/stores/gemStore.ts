/**
 * Arcane Gems - Multi-Slot Gem Store (v5)
 *
 * Zustand store for managing multiple gem slots.
 * Users can have multiple gems (based on Toss contactsViral rewards).
 * Free tier: 1 slot, Referral bonus: +1 slot per successful share (up to 10 total).
 *
 * Persisted to localStorage with migration from:
 * - v1 (collection array) → v5 (contactsViral-based)
 * - v2 (single gem) → v5 (contactsViral-based)
 * - v3 (IAP-based) → v5 (contactsViral-based)
 * - v4 (custom referral) → v5 (contactsViral-based, removed referredBy/isFirstSummon)
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

  // Referral tracking (used by Toss contactsViral)
  userId: string | null; // Unique user ID
  referralCount: number; // Number of successful referrals (each adds +1 slot)

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

  // Referral system (Toss contactsViral)
  setUserId: (userId: string) => void;
  incrementReferralCount: () => void; // Adds +1 slot when user shares via contactsViral

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

interface LegacyV3State {
  gems?: Record<number, MagicGem>;
  activeSlot?: number;
  maxSlots?: number;
  packsPurchased?: number;
  currentGem?: MagicGem | null;
  lastUserInfo?: UserInfo | null;
  powerDescRevealed?: boolean;
}

interface LegacyV4State {
  gems?: Record<number, MagicGem>;
  activeSlot?: number;
  maxSlots?: number;
  userId?: string | null;
  referralCount?: number;
  referredBy?: string | null;  // Deprecated, removed in v5
  isFirstSummon?: boolean;     // Deprecated, removed in v5
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
      userId: null,
      referralCount: 0,
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

      // =============================================================================
      // Referral System (Toss contactsViral)
      // =============================================================================

      setUserId: (userId) => {
        set({ userId });
      },

      incrementReferralCount: () => {
        const state = get();
        const newCount = state.referralCount + 1;
        const newMaxSlots = Math.min(
          STORAGE_CONSTANTS.BASE_SLOTS + newCount,
          STORAGE_CONSTANTS.MAX_SLOTS
        );
        set({
          referralCount: newCount,
          maxSlots: newMaxSlots,
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
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migration from v1 (collection array) to v5 (contactsViral-based)
          const old = persistedState as LegacyV1State;
          const firstGem = old.gems?.[0] ?? null;

          console.log(
            `[GemStore] Migrating from v1 to v5. Preserving ${firstGem ? 'first gem' : 'no gem'}.`
          );

          const gems: Record<number, MagicGem> = {};
          if (firstGem) {
            gems[0] = firstGem;
          }

          return {
            gems,
            activeSlot: 0,
            maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
            userId: null,
            referralCount: 0,
            currentGem: firstGem,
            lastUserInfo: null,
            powerDescRevealed: false,
          } as GemStoreState;
        }

        if (version === 2) {
          // Migration from v2 (single gem) to v5 (contactsViral-based)
          const old = persistedState as LegacyV2State;

          console.log(
            `[GemStore] Migrating from v2 to v5. Preserving ${old.currentGem ? 'current gem' : 'no gem'}.`
          );

          const gems: Record<number, MagicGem> = {};
          if (old.currentGem) {
            gems[0] = old.currentGem;
          }

          return {
            gems,
            activeSlot: 0,
            maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
            userId: null,
            referralCount: 0,
            currentGem: old.currentGem ?? null,
            lastUserInfo: old.lastUserInfo ?? null,
            powerDescRevealed: old.powerDescRevealed ?? false,
          } as GemStoreState;
        }

        if (version === 3) {
          // Migration from v3 (IAP-based) to v5 (contactsViral-based)
          const old = persistedState as LegacyV3State;

          console.log(
            `[GemStore] Migrating from v3 to v5. Converting IAP to contactsViral-based slots.`
          );

          // Convert packsPurchased to equivalent referral count
          // Preserve existing maxSlots from previous purchases
          const existingMaxSlots = old.maxSlots ?? STORAGE_CONSTANTS.BASE_SLOTS;
          const referralEquivalent = existingMaxSlots - STORAGE_CONSTANTS.BASE_SLOTS;

          return {
            gems: old.gems ?? {},
            activeSlot: old.activeSlot ?? 0,
            maxSlots: existingMaxSlots,
            userId: null,
            referralCount: referralEquivalent,
            currentGem: getCurrentGem(old.gems ?? {}, old.activeSlot ?? 0),
            lastUserInfo: old.lastUserInfo ?? null,
            powerDescRevealed: old.powerDescRevealed ?? false,
          } as GemStoreState;
        }

        if (version === 4) {
          // Migration from v4 (custom referral) to v5 (contactsViral-based)
          // Remove deprecated fields: referredBy, isFirstSummon
          const old = persistedState as LegacyV4State;

          console.log(
            `[GemStore] Migrating from v4 to v5. Removing deprecated referral fields.`
          );

          return {
            gems: old.gems ?? {},
            activeSlot: old.activeSlot ?? 0,
            maxSlots: old.maxSlots ?? STORAGE_CONSTANTS.BASE_SLOTS,
            userId: old.userId ?? null,
            referralCount: old.referralCount ?? 0,
            currentGem: getCurrentGem(old.gems ?? {}, old.activeSlot ?? 0),
            lastUserInfo: old.lastUserInfo ?? null,
            powerDescRevealed: old.powerDescRevealed ?? false,
          } as GemStoreState;
        }

        // v5 or newer - ensure currentGem is computed correctly
        const state = persistedState as GemStoreState;
        return {
          ...state,
          currentGem: getCurrentGem(state.gems ?? {}, state.activeSlot ?? 0),
        };
      },
    }
  )
);
