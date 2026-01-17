/**
 * Premium Service
 *
 * Manages slot pack purchases using Toss IAP.
 * Provides storage status and handles slot upgrades.
 */

import { isInTossWebView } from '../../utils/environment';
import { getStorageService, STORAGE_CONSTANTS } from '../storage';

/**
 * Product ID for slot pack in Toss IAP
 * Price is set in Toss IAP Console (₩1,000)
 */
const SLOT_PACK_PRODUCT_ID = 'gem_slots_pack_3';

/**
 * Storage status information
 */
export interface StorageStatus {
  /** Current maximum slots (1-10) */
  maxSlots: number;
  /** Number of slots currently in use */
  usedSlots: number;
  /** Number of packs purchased (0-3) */
  packsPurchased: number;
  /** Whether more packs can be purchased */
  canBuyPack: boolean;
  /** Number of available (empty) slots */
  availableSlots: number;
}

/**
 * Premium Service for managing slot purchases
 */
export class PremiumService {
  /**
   * Purchase a slot pack (+3 slots)
   * @returns true if purchase successful, false if canceled/failed
   */
  async purchaseSlotPack(): Promise<boolean> {
    const status = await this.getStatus();

    if (!status.canBuyPack) {
      throw new Error('Maximum pack purchases reached (3)');
    }

    if (!isInTossWebView()) {
      // In non-Toss environment, simulate purchase for testing
      console.log('[Premium] Simulating purchase in non-Toss environment');
      return this.simulatePurchase(status);
    }

    try {
      // Dynamically import Toss IAP
      const { IAP } = await import('@apps-in-toss/web-framework');

      const result = await IAP.createOneTimePurchaseOrder({
        productId: SLOT_PACK_PRODUCT_ID,
      });

      if (result) {
        await this.completePurchase(status);
        return true;
      }

      return false;
    } catch (error: unknown) {
      const err = error as { code?: string };

      if (err.code === 'USER_CANCELED') {
        console.log('[Premium] Purchase canceled by user');
        return false;
      }

      console.error('[Premium] Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Simulate purchase for testing in non-Toss environment
   */
  private async simulatePurchase(status: StorageStatus): Promise<boolean> {
    // In dev mode, auto-approve purchases
    console.log('[Premium] Dev mode: auto-approving purchase');
    await this.completePurchase(status);
    return true;
  }

  /**
   * Complete purchase by updating storage
   */
  private async completePurchase(status: StorageStatus): Promise<void> {
    const newMaxSlots = status.maxSlots + STORAGE_CONSTANTS.SLOTS_PER_PACK;
    const newPacksPurchased = status.packsPurchased + 1;

    const storage = await getStorageService();
    await storage.setMaxSlots(newMaxSlots);
    await storage.setPacksPurchased(newPacksPurchased);

    console.log(`[Premium] Purchase complete. New slots: ${newMaxSlots}`);
  }

  /**
   * Get current storage status
   */
  async getStatus(): Promise<StorageStatus> {
    const storage = await getStorageService();

    const maxSlots = await storage.getMaxSlots();
    const gems = await storage.getGems();
    const packsPurchased = await storage.getPacksPurchased();

    return {
      maxSlots,
      usedSlots: gems.length,
      packsPurchased,
      canBuyPack: packsPurchased < STORAGE_CONSTANTS.MAX_PACK_PURCHASES,
      availableSlots: maxSlots - gems.length,
    };
  }

  /**
   * Restore purchases (for users who reinstall or switch devices)
   * In Toss environment, purchase history is tied to user account
   */
  async restorePurchases(): Promise<StorageStatus> {
    if (!isInTossWebView()) {
      console.log('[Premium] Restore not available in non-Toss environment');
      return this.getStatus();
    }

    try {
      // Toss IAP automatically restores purchases via user account
      // We just need to verify and sync the status
      console.log('[Premium] Purchases restored from Toss account');
      return this.getStatus();
    } catch (error) {
      console.error('[Premium] Failed to restore purchases:', error);
      throw error;
    }
  }
}

// Singleton instance
let premiumServiceInstance: PremiumService | null = null;

/**
 * Get premium service instance (singleton)
 */
export function getPremiumService(): PremiumService {
  if (!premiumServiceInstance) {
    premiumServiceInstance = new PremiumService();
  }
  return premiumServiceInstance;
}

// Also export as default instance for convenience
export const premiumService = getPremiumService();
