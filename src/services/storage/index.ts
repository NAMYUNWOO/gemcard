/**
 * Storage Service Factory
 *
 * Automatically selects the appropriate storage service based on environment:
 * - Toss WebView: FirestoreService (cloud storage)
 * - Regular Browser: LocalStorageService (local storage)
 */

import { isInTossWebView, shouldUseFirebase } from '../../utils/environment';
import { LocalStorageService } from './LocalStorageService';
import { FirestoreService } from './FirestoreService';
import type { GemStorageService } from './types';

/** Singleton storage service instance */
let instance: GemStorageService | null = null;

/** Whether the service is currently initializing */
let initPromise: Promise<void> | null = null;

/**
 * Get the storage service instance (singleton)
 *
 * Automatically selects the appropriate implementation based on environment:
 * - Toss WebView: FirestoreService
 * - Regular Browser: LocalStorageService
 *
 * @returns Initialized storage service
 */
export async function getStorageService(): Promise<GemStorageService> {
  // If already initializing, wait for it
  if (initPromise) {
    await initPromise;
    return instance!;
  }

  // If already initialized, return cached instance
  if (instance) {
    return instance;
  }

  // Create and initialize the appropriate service
  const isToss = isInTossWebView();
  const useFirebase = shouldUseFirebase();
  console.log(`[Storage] Environment: ${isToss ? 'Toss WebView' : 'Web Browser'}, Using: ${useFirebase ? 'Firebase' : 'LocalStorage'}`);

  const service = useFirebase ? new FirestoreService() : new LocalStorageService();

  initPromise = (async () => {
    try {
      await service.initialize();
      instance = service;
      console.log('[Storage] Service initialized successfully');
    } catch (e) {
      console.error('[Storage] Failed to initialize:', e);
      // Fall back to localStorage if Firestore fails
      if (useFirebase) {
        console.log('[Storage] Falling back to LocalStorageService');
        const fallback = new LocalStorageService();
        await fallback.initialize();
        instance = fallback;
        console.log('[Storage] LocalStorage fallback initialized');
      } else {
        throw e;
      }
    }
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }

  return instance!;
}

/**
 * Reset the storage service (for testing)
 */
export function resetStorageService(): void {
  instance = null;
  initPromise = null;
}

// Re-export types
export type { GemStorageService, GemSlotData } from './types';
export { STORAGE_CONSTANTS } from './types';
