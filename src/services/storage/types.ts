/**
 * Storage Service Types
 *
 * Abstract interface for gem storage that can be implemented by
 * different backends (localStorage, Firestore, etc.)
 */

import type { MagicGem, UserInfo } from '../../types/gem';

/**
 * Gem slot data for multi-slot storage
 */
export interface GemSlotData {
  gem: MagicGem;
  slot: number;
  isActive: boolean;
}

/**
 * Storage service interface
 * Implemented by LocalStorageService and FirestoreService
 */
export interface GemStorageService {
  /**
   * Initialize the storage service
   * Should be called before any other methods
   */
  initialize(): Promise<void>;

  // =============================================================================
  // Gem Operations
  // =============================================================================

  /**
   * Get all gems from storage
   */
  getGems(): Promise<MagicGem[]>;

  /**
   * Get the currently active gem
   */
  getActiveGem(): Promise<MagicGem | null>;

  /**
   * Get gem at specific slot
   */
  getGemAtSlot(slot: number): Promise<MagicGem | null>;

  /**
   * Save a gem to a specific slot
   * If a gem already exists in that slot, it will be replaced
   */
  setGem(gem: MagicGem, slot: number): Promise<void>;

  /**
   * Delete a gem by ID
   */
  deleteGem(gemId: string): Promise<void>;

  /**
   * Set which slot is currently active
   */
  setActiveSlot(slot: number): Promise<void>;

  /**
   * Get the currently active slot number
   */
  getActiveSlot(): Promise<number>;

  // =============================================================================
  // Slot Management
  // =============================================================================

  /**
   * Get maximum number of slots available
   */
  getMaxSlots(): Promise<number>;

  /**
   * Set maximum number of slots (after purchase)
   */
  setMaxSlots(slots: number): Promise<void>;

  /**
   * Find the first available (empty) slot
   * Returns null if all slots are full
   */
  getAvailableSlot(): Promise<number | null>;

  // =============================================================================
  // Purchase Tracking
  // =============================================================================

  /**
   * Get number of slot packs purchased (0-3)
   */
  getPacksPurchased(): Promise<number>;

  /**
   * Set number of slot packs purchased
   */
  setPacksPurchased(count: number): Promise<void>;

  // =============================================================================
  // User Info
  // =============================================================================

  /**
   * Get last used user info for form pre-fill
   */
  getLastUserInfo(): Promise<UserInfo | null>;

  /**
   * Save user info for form pre-fill
   */
  setLastUserInfo(info: UserInfo): Promise<void>;

  // =============================================================================
  // Spoiler State
  // =============================================================================

  /**
   * Get whether power description has been revealed
   */
  getPowerDescRevealed(): Promise<boolean>;

  /**
   * Set power description revealed state
   */
  setPowerDescRevealed(revealed: boolean): Promise<void>;
}

/**
 * Storage constants
 */
export const STORAGE_CONSTANTS = {
  /** Base number of slots (free tier) */
  BASE_SLOTS: 1,
  /** Slots added per pack purchase */
  SLOTS_PER_PACK: 3,
  /** Maximum pack purchases allowed */
  MAX_PACK_PURCHASES: 3,
  /** Maximum total slots (1 + 3*3 = 10) */
  MAX_SLOTS: 10,
} as const;
