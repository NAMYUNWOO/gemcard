/**
 * Arcane Gems - Gem Collection Store
 *
 * Zustand store for managing the user's gem collection.
 * Persisted to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MagicGem, Rarity } from '../types/gem';
import { RARITY_ORDER } from '../types/gem';

// =============================================================================
// Types
// =============================================================================

export type SortOption = 'newest' | 'oldest' | 'rarity-high' | 'rarity-low' | 'name';
export type FilterOption = 'all' | Rarity;

interface GemStoreState {
  // State
  gems: MagicGem[];
  sortBy: SortOption;
  filterBy: FilterOption;
}

interface GemStoreActions {
  // Actions
  addGem: (gem: MagicGem) => void;
  removeGem: (id: string) => void;
  getGem: (id: string) => MagicGem | undefined;
  updateGem: (id: string, updates: Partial<MagicGem>) => void;

  // Sort & Filter
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  getSortedAndFilteredGems: () => MagicGem[];

  // Stats
  getStats: () => {
    total: number;
    byRarity: Record<Rarity, number>;
  };

  // Debug
  clearAllGems: () => void;
}

type GemStore = GemStoreState & GemStoreActions;

// =============================================================================
// Helper Functions
// =============================================================================

function sortGems(gems: MagicGem[], sortBy: SortOption): MagicGem[] {
  const sorted = [...gems];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.obtainedAt - a.obtainedAt);
    case 'oldest':
      return sorted.sort((a, b) => a.obtainedAt - b.obtainedAt);
    case 'rarity-high':
      return sorted.sort(
        (a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
      );
    case 'rarity-low':
      return sorted.sort(
        (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      );
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

function filterGems(gems: MagicGem[], filterBy: FilterOption): MagicGem[] {
  if (filterBy === 'all') {
    return gems;
  }
  return gems.filter((gem) => gem.rarity === filterBy);
}

// =============================================================================
// Store
// =============================================================================

export const useGemStore = create<GemStore>()(
  persist(
    (set, get) => ({
      // Initial State
      gems: [],
      sortBy: 'newest',
      filterBy: 'all',

      // Actions
      addGem: (gem) =>
        set((state) => ({
          gems: [...state.gems, gem],
        })),

      removeGem: (id) =>
        set((state) => ({
          gems: state.gems.filter((g) => g.id !== id),
        })),

      getGem: (id) => get().gems.find((g) => g.id === id),

      updateGem: (id, updates) =>
        set((state) => ({
          gems: state.gems.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      // Sort & Filter
      setSortBy: (sortBy) => set({ sortBy }),
      setFilterBy: (filterBy) => set({ filterBy }),

      getSortedAndFilteredGems: () => {
        const { gems, sortBy, filterBy } = get();
        const filtered = filterGems(gems, filterBy);
        return sortGems(filtered, sortBy);
      },

      // Stats
      getStats: () => {
        const { gems } = get();
        const byRarity: Record<Rarity, number> = {
          common: 0,
          uncommon: 0,
          rare: 0,
          epic: 0,
          legendary: 0,
        };

        gems.forEach((gem) => {
          byRarity[gem.rarity]++;
        });

        return {
          total: gems.length,
          byRarity,
        };
      },

      // Debug
      clearAllGems: () => set({ gems: [] }),
    }),
    {
      name: 'arcane-gems-collection',
      version: 1,
    }
  )
);
