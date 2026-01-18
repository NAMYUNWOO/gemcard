/**
 * Toss Storage Service
 *
 * Implements GemStorageService using Toss native Storage API for persistence.
 * Used when app is running inside Toss WebView (App in Toss).
 *
 * Uses @apps-in-toss/web-framework Storage API which provides
 * persistent key-value storage within the Toss ecosystem.
 */

import { Storage } from '@apps-in-toss/web-framework';
import type { MagicGem, UserInfo } from '../../types/gem';
import type { GemStorageService } from './types';
import { STORAGE_CONSTANTS } from './types';

/** Storage key for Toss Storage */
const STORAGE_KEY = 'arcane-gems-storage-v4';

/** Internal storage structure */
interface StorageData {
  version: 4;
  gems: Record<number, MagicGem>; // slot -> gem
  activeSlot: number;
  maxSlots: number;
  referralCount: number;
  referredBy: string | null;
  lastUserInfo: UserInfo | null;
  powerDescRevealed: boolean;
}

/**
 * Create default storage data
 */
function createDefaultData(): StorageData {
  return {
    version: 4,
    gems: {},
    activeSlot: 0,
    maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
    referralCount: 0,
    referredBy: null,
    lastUserInfo: null,
    powerDescRevealed: false,
  };
}

/**
 * Toss Storage implementation of GemStorageService
 */
export class TossStorageService implements GemStorageService {
  private data: StorageData = createDefaultData();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await Storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = this.migrateIfNeeded(parsed);
      }
    } catch (e) {
      console.warn('[TossStorageService] Failed to load data, using defaults:', e);
      this.data = createDefaultData();
    }

    this.initialized = true;
    await this.persist();
  }

  /**
   * Migrate from older versions if needed
   */
  private migrateIfNeeded(data: unknown): StorageData {
    const d = data as { version?: number; packsPurchased?: number } & Partial<Omit<StorageData, 'version'>>;

    if (!d.version || d.version < 3) {
      return this.migrateFromV2(data);
    }

    if (d.version === 3) {
      return this.migrateFromV3(data);
    }

    return {
      version: 4,
      gems: d.gems ?? {},
      activeSlot: d.activeSlot ?? 0,
      maxSlots: d.maxSlots ?? STORAGE_CONSTANTS.BASE_SLOTS,
      referralCount: d.referralCount ?? 0,
      referredBy: d.referredBy ?? null,
      lastUserInfo: d.lastUserInfo ?? null,
      powerDescRevealed: d.powerDescRevealed ?? false,
    };
  }

  /**
   * Migrate from v2 (single gem) to v4 (referral-based)
   */
  private migrateFromV2(oldData: unknown): StorageData {
    const old = oldData as {
      state?: {
        currentGem?: MagicGem | null;
        lastUserInfo?: UserInfo | null;
        powerDescRevealed?: boolean;
      };
    };

    console.log('[TossStorageService] Migrating from v2 to v4');

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
   * Migrate from v3 (IAP-based) to v4 (referral-based)
   */
  private migrateFromV3(oldData: unknown): StorageData {
    const old = oldData as {
      gems?: Record<number, MagicGem>;
      activeSlot?: number;
      maxSlots?: number;
      packsPurchased?: number;
      lastUserInfo?: UserInfo | null;
      powerDescRevealed?: boolean;
    };

    console.log('[TossStorageService] Migrating from v3 to v4');

    // Preserve existing maxSlots from IAP purchases
    const existingMaxSlots = old.maxSlots ?? STORAGE_CONSTANTS.BASE_SLOTS;
    const referralEquivalent = existingMaxSlots - STORAGE_CONSTANTS.BASE_SLOTS;

    return {
      version: 4,
      gems: old.gems ?? {},
      activeSlot: old.activeSlot ?? 0,
      maxSlots: existingMaxSlots,
      referralCount: referralEquivalent,
      referredBy: null,
      lastUserInfo: old.lastUserInfo ?? null,
      powerDescRevealed: old.powerDescRevealed ?? false,
    };
  }

  /**
   * Persist data to Toss Storage
   */
  private async persist(): Promise<void> {
    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[TossStorageService] Failed to persist data:', e);
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
    await this.persist();
  }

  async deleteGem(gemId: string): Promise<void> {
    for (const [slotStr, gem] of Object.entries(this.data.gems)) {
      if (gem.id === gemId) {
        const slot = parseInt(slotStr, 10);
        delete this.data.gems[slot];
        await this.persist();
        return;
      }
    }
  }

  async setActiveSlot(slot: number): Promise<void> {
    if (slot < 0 || slot >= this.data.maxSlots) {
      throw new Error(`Invalid slot: ${slot}. Max slots: ${this.data.maxSlots}`);
    }
    this.data.activeSlot = slot;
    await this.persist();
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
    await this.persist();
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
  // Referral Tracking
  // =============================================================================

  async getReferralCount(): Promise<number> {
    return this.data.referralCount;
  }

  async setReferralCount(count: number): Promise<void> {
    this.data.referralCount = Math.min(
      Math.max(count, 0),
      STORAGE_CONSTANTS.MAX_REFERRALS
    );
    await this.persist();
  }

  async getReferredBy(): Promise<string | null> {
    return this.data.referredBy;
  }

  async setReferredBy(referrerId: string): Promise<void> {
    // Only set if not already referred (one-time)
    if (!this.data.referredBy) {
      this.data.referredBy = referrerId;
      await this.persist();
    }
  }

  // =============================================================================
  // User Info
  // =============================================================================

  async getLastUserInfo(): Promise<UserInfo | null> {
    return this.data.lastUserInfo;
  }

  async setLastUserInfo(info: UserInfo): Promise<void> {
    this.data.lastUserInfo = info;
    await this.persist();
  }

  // =============================================================================
  // Spoiler State
  // =============================================================================

  async getPowerDescRevealed(): Promise<boolean> {
    return this.data.powerDescRevealed;
  }

  async setPowerDescRevealed(revealed: boolean): Promise<void> {
    this.data.powerDescRevealed = revealed;
    await this.persist();
  }
}
