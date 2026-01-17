/**
 * usePremium Hook
 *
 * Provides premium/storage status and purchase functionality.
 * Manages slot pack purchases and status display.
 */

import { useState, useEffect, useCallback } from 'react';
import { premiumService, type StorageStatus } from '../services/premium/PremiumService';
import { useGemStore } from '../stores/gemStore';

/**
 * Default storage status
 */
const DEFAULT_STATUS: StorageStatus = {
  maxSlots: 1,
  usedSlots: 0,
  packsPurchased: 0,
  canBuyPack: true,
  availableSlots: 1,
};

/**
 * Premium hook state
 */
interface PremiumState extends StorageStatus {
  /** Whether status is loading */
  loading: boolean;
  /** Whether a purchase is in progress */
  purchasing: boolean;
  /** Error if any operation failed */
  error: Error | null;
  /** Purchase a slot pack (+3 slots) */
  buySlotPack: () => Promise<boolean>;
  /** Refresh status */
  refresh: () => Promise<void>;
}

/**
 * Hook to access premium status and purchase functionality
 *
 * @returns Premium state with status and purchase functions
 *
 * @example
 * const { maxSlots, canBuyPack, buySlotPack, loading } = usePremium();
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <div>
 *     <p>Slots: {usedSlots}/{maxSlots}</p>
 *     {canBuyPack && (
 *       <button onClick={buySlotPack}>Buy +3 Slots (₩1,000)</button>
 *     )}
 *   </div>
 * );
 */
export function usePremium(): PremiumState {
  const [status, setStatus] = useState<StorageStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get gemStore actions for syncing
  const { setMaxSlots, setPacksPurchased } = useGemStore();

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const newStatus = await premiumService.getStatus();
      setStatus(newStatus);

      // Sync with gemStore
      setMaxSlots(newStatus.maxSlots);
      setPacksPurchased(newStatus.packsPurchased);
    } catch (e) {
      console.error('[usePremium] Failed to refresh status:', e);
      setError(e instanceof Error ? e : new Error('Failed to get status'));
    }
  }, [setMaxSlots, setPacksPurchased]);

  const buySlotPack = useCallback(async (): Promise<boolean> => {
    if (purchasing) return false;

    try {
      setPurchasing(true);
      setError(null);

      const success = await premiumService.purchaseSlotPack();

      if (success) {
        await refresh();
      }

      return success;
    } catch (e) {
      console.error('[usePremium] Purchase failed:', e);
      setError(e instanceof Error ? e : new Error('Purchase failed'));
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [purchasing, refresh]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };
    init();
  }, [refresh]);

  return {
    ...status,
    loading,
    purchasing,
    error,
    buySlotPack,
    refresh,
  };
}
