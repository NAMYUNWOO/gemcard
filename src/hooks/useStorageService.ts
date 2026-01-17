/**
 * useStorageService Hook
 *
 * Provides access to the storage service with initialization state.
 * Automatically selects the appropriate storage backend based on environment.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorageService, type GemStorageService } from '../services/storage';

/**
 * Storage service state
 */
interface StorageServiceState {
  /** The storage service instance (null while initializing) */
  service: GemStorageService | null;
  /** Whether the service is initialized */
  initialized: boolean;
  /** Error if initialization failed */
  error: Error | null;
  /** Retry initialization */
  retry: () => void;
}

/**
 * Hook to access the storage service
 *
 * @returns Storage service state with initialization status
 *
 * @example
 * const { service, initialized, error } = useStorageService();
 *
 * if (!initialized) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * const gems = await service.getGems();
 */
export function useStorageService(): StorageServiceState {
  const [service, setService] = useState<GemStorageService | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      const storageService = await getStorageService();
      setService(storageService);
      setInitialized(true);
    } catch (e) {
      console.error('[useStorageService] Initialization failed:', e);
      setError(e instanceof Error ? e : new Error('Failed to initialize storage'));
      setInitialized(false);
    }
  }, []);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize, retryCount]);

  return { service, initialized, error, retry };
}
