/**
 * LocalStorage Service
 *
 * Implements GemStorageService using localStorage for persistence.
 * Used when app is running outside of Toss WebView (regular browser).
 */

import type { MagicGem, UserInfo } from '../../types/gem';
import type { GemStorageService } from './types';
import { STORAGE_CONSTANTS } from './types';

/** Storage keys */
const STORAGE_KEY = 'arcane-gems-storage-v3';

/** Internal storage structure */
interface StorageData {
  version: 3;
  gems: Record<number, MagicGem>; // slot -> gem
  activeSlot: number;
  maxSlots: number;
  packsPurchased: number;
  lastUserInfo: UserInfo | null;
  powerDescRevealed: boolean;
}

/**
 * Create default storage data
 */
function createDefaultData(): StorageData {
  return {
    version: 3,
    gems: {},
    activeSlot: 0,
    maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
    packsPurchased: 0,
    lastUserInfo: null,
    powerDescRevealed: false,
  };
}

/**
 * LocalStorage implementation of GemStorageService
 */
export class LocalStorageService implements GemStorageService {
  private data: StorageData = createDefaultData();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = this.migrateIfNeeded(parsed);
      } else {
        // Check for old v2 data and migrate
        const oldData = localStorage.getItem('arcane-gems-collection');
        if (oldData) {
          const parsed = JSON.parse(oldData);
          this.data = this.migrateFromV2(parsed);
        }
      }
    } catch (e) {
      console.warn('[LocalStorageService] Failed to load data, using defaults:', e);
      this.data = createDefaultData();
    }

    this.initialized = true;
    this.persist();
  }

  /**
   * Migrate from older versions if needed
   */
  private migrateIfNeeded(data: unknown): StorageData {
    const d = data as Partial<StorageData> & { version?: number };

    if (!d.version || d.version < 3) {
      return this.migrateFromV2(data);
    }

    return {
      version: 3,
      gems: d.gems ?? {},
      activeSlot: d.activeSlot ?? 0,
      maxSlots: d.maxSlots ?? STORAGE_CONSTANTS.BASE_SLOTS,
      packsPurchased: d.packsPurchased ?? 0,
      lastUserInfo: d.lastUserInfo ?? null,
      powerDescRevealed: d.powerDescRevealed ?? false,
    };
  }

  /**
   * Migrate from v2 (single gem) to v3 (multi-slot)
   */
  private migrateFromV2(oldData: unknown): StorageData {
    const old = oldData as {
      state?: {
        currentGem?: MagicGem | null;
        lastUserInfo?: UserInfo | null;
        powerDescRevealed?: boolean;
      };
    };

    console.log('[LocalStorageService] Migrating from v2 to v3');

    const newData = createDefaultData();

    // Migrate current gem to slot 0
    if (old.state?.currentGem) {
      newData.gems[0] = old.state.currentGem;
    }

    // Migrate user info
    if (old.state?.lastUserInfo) {
      newData.lastUserInfo = old.state.lastUserInfo;
    }

    // Migrate spoiler state
    if (old.state?.powerDescRevealed !== undefined) {
      newData.powerDescRevealed = old.state.powerDescRevealed;
    }

    return newData;
  }

  /**
   * Persist data to localStorage
   */
  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[LocalStorageService] Failed to persist data:', e);
    }
  }

  // =============================================================================
  // Gem Operations
  // =============================================================================

  async getGems(): Promise<MagicGem[]> {
    return Object.values(this.data.gems);
  }

  async getActiveGem(): Promise<MagicGem | null> {
    return this.data.gems[this.data.activeSlot] ?? null;
  }

  async getGemAtSlot(slot: number): Promise<MagicGem | null> {
    return this.data.gems[slot] ?? null;
  }

  async setGem(gem: MagicGem, slot: number): Promise<void> {
    if (slot < 0 || slot >= this.data.maxSlots) {
      throw new Error(`Invalid slot: ${slot}. Max slots: ${this.data.maxSlots}`);
    }

    this.data.gems[slot] = gem;
    this.data.activeSlot = slot;
    this.data.powerDescRevealed = false; // Reset spoiler for new gem
    this.persist();
  }

  async deleteGem(gemId: string): Promise<void> {
    for (const [slotStr, gem] of Object.entries(this.data.gems)) {
      if (gem.id === gemId) {
        const slot = parseInt(slotStr, 10);
        delete this.data.gems[slot];
        this.persist();
        return;
      }
    }
  }

  async setActiveSlot(slot: number): Promise<void> {
    if (slot < 0 || slot >= this.data.maxSlots) {
      throw new Error(`Invalid slot: ${slot}. Max slots: ${this.data.maxSlots}`);
    }
    this.data.activeSlot = slot;
    this.persist();
  }

  async getActiveSlot(): Promise<number> {
    return this.data.activeSlot;
  }

  // =============================================================================
  // Slot Management
  // =============================================================================

  async getMaxSlots(): Promise<number> {
    return this.data.maxSlots;
  }

  async setMaxSlots(slots: number): Promise<void> {
    this.data.maxSlots = Math.min(
      Math.max(slots, STORAGE_CONSTANTS.BASE_SLOTS),
      STORAGE_CONSTANTS.MAX_SLOTS
    );
    this.persist();
  }

  async getAvailableSlot(): Promise<number | null> {
    for (let i = 0; i < this.data.maxSlots; i++) {
      if (!this.data.gems[i]) {
        return i;
      }
    }
    return null;
  }

  // =============================================================================
  // Purchase Tracking
  // =============================================================================

  async getPacksPurchased(): Promise<number> {
    return this.data.packsPurchased;
  }

  async setPacksPurchased(count: number): Promise<void> {
    this.data.packsPurchased = Math.min(
      Math.max(count, 0),
      STORAGE_CONSTANTS.MAX_PACK_PURCHASES
    );
    this.persist();
  }

  // =============================================================================
  // User Info
  // =============================================================================

  async getLastUserInfo(): Promise<UserInfo | null> {
    return this.data.lastUserInfo;
  }

  async setLastUserInfo(info: UserInfo): Promise<void> {
    this.data.lastUserInfo = info;
    this.persist();
  }

  // =============================================================================
  // Spoiler State
  // =============================================================================

  async getPowerDescRevealed(): Promise<boolean> {
    return this.data.powerDescRevealed;
  }

  async setPowerDescRevealed(revealed: boolean): Promise<void> {
    this.data.powerDescRevealed = revealed;
    this.persist();
  }
}
