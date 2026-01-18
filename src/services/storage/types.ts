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
  // Referral Tracking
  // =============================================================================

  /**
   * Get number of successful referrals
   */
  getReferralCount(): Promise<number>;

  /**
   * Set number of successful referrals
   */
  setReferralCount(count: number): Promise<void>;

  /**
   * Get the user ID who referred this user (one-time)
   */
  getReferredBy(): Promise<string | null>;

  /**
   * Set the referrer user ID (one-time)
   */
  setReferredBy(referrerId: string): Promise<void>;

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
  /** Slots added per successful referral */
  SLOTS_PER_REFERRAL: 1,
  /** Maximum total referrals allowed (9 referrals = 10 total slots) */
  MAX_REFERRALS: 9,
  /** Maximum total slots (1 + 9 = 10) */
  MAX_SLOTS: 10,
} as const;
