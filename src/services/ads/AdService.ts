/**
 * Ad Service
 *
 * Manages rewarded ads for gem replacement using Toss Ads (Google AdMob).
 * Users must watch a rewarded ad before replacing a gem in an occupied slot.
 */

import { isInTossWebView, isDevelopment } from '../../utils/environment';

/**
 * Ad Unit IDs
 * - Test ID: For development and testing (provided by Toss)
 * - Production ID: Registered in Toss Ads Console
 */
// const TEST_REWARDED_AD_ID = 'ca-app-pub-3940256099942544/5224354917'; // Google AdMob test ID
const TEST_REWARDED_AD_ID = 'ait-ad-test-rewarded-id'; // 앱인토스 테스트 ID
const PROD_REWARDED_AD_ID = 'gemcard-rewarded-replace'; // Replace after creating in console

/**
 * Get the appropriate ad ID based on environment
 */
function getRewardedAdId(): string {
  // Use test ID in development or when not in Toss
  if (isDevelopment() || !isInTossWebView()) {
    return TEST_REWARDED_AD_ID;
  }
  return PROD_REWARDED_AD_ID;
}

/**
 * Ad Service for managing rewarded ads
 */
export class AdService {
  private adLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Preload rewarded ad for faster display
   * Call this when entering a page where ad might be needed
   */
  async preloadRewardedAd(): Promise<void> {
    if (!isInTossWebView()) {
      console.log('[AdService] Not in Toss WebView, skipping ad preload');
      return;
    }

    // If already loading, wait for it
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    // If already loaded, no need to load again
    if (this.adLoaded) {
      return;
    }

    this.loadingPromise = this.doPreload();

    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Internal preload implementation
   */
  private async doPreload(): Promise<void> {
    try {
      const { GoogleAdMob } = await import('@apps-in-toss/web-framework');

      // Check if supported
      if (GoogleAdMob.loadAdMobRewardedAd.isSupported && !GoogleAdMob.loadAdMobRewardedAd.isSupported()) {
        console.log('[AdService] Rewarded ads not supported in this environment');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        GoogleAdMob.loadAdMobRewardedAd({
          options: {
            adUnitId: getRewardedAdId(),
          },
          onEvent: (event) => {
            if (event.type === 'loaded') {
              this.adLoaded = true;
              console.log('[AdService] Rewarded ad preloaded successfully');
              resolve();
            }
          },
          onError: (error) => {
            console.error('[AdService] Failed to preload ad:', error);
            this.adLoaded = false;
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('[AdService] Failed to preload ad:', error);
      this.adLoaded = false;
    }
  }

  /**
   * Show rewarded ad for gem replacement
   * @returns true if ad was watched successfully (or skipped in non-Toss), false if canceled/failed
   */
  async showRewardedAd(): Promise<boolean> {
    if (!isInTossWebView()) {
      // In non-Toss environment, allow action without ad
      console.log('[AdService] Not in Toss WebView, skipping ad requirement');
      return true;
    }

    // If ad not loaded, try to load it first
    if (!this.adLoaded) {
      await this.preloadRewardedAd();

      if (!this.adLoaded) {
        // Ad failed to load, allow action anyway for better UX
        console.warn('[AdService] Ad not available, allowing action');
        return true;
      }
    }

    try {
      const { GoogleAdMob } = await import('@apps-in-toss/web-framework');

      // Check if supported
      if (GoogleAdMob.showAdMobRewardedAd.isSupported && !GoogleAdMob.showAdMobRewardedAd.isSupported()) {
        console.log('[AdService] Showing rewarded ads not supported');
        return true;
      }

      const result = await new Promise<boolean>((resolve) => {
        let rewarded = false;

        GoogleAdMob.showAdMobRewardedAd({
          options: {
            adUnitId: getRewardedAdId(),
          },
          onEvent: (event) => {
            if (event.type === 'rewarded') {
              rewarded = true;
            }
            if (event.type === 'closed') {
              resolve(rewarded);
            }
          },
          onError: (error) => {
            console.error('[AdService] Failed to show ad:', error);
            resolve(true); // Allow action on error
          },
        });
      });

      // Reset loaded state after showing
      this.adLoaded = false;

      // Preload next ad in background
      this.preloadRewardedAd();

      if (result) {
        console.log('[AdService] Ad watched successfully, reward earned');
      } else {
        console.log('[AdService] Ad closed without earning reward');
      }

      return result;
    } catch (error) {
      console.error('[AdService] Failed to show ad:', error);
      this.adLoaded = false;

      // On error, allow action for better UX
      return true;
    }
  }

  /**
   * Check if ad is ready to show
   */
  isAdReady(): boolean {
    return this.adLoaded;
  }

  /**
   * Check if ads are available in current environment
   */
  isAdAvailable(): boolean {
    return isInTossWebView();
  }
}

// Singleton instance
let adServiceInstance: AdService | null = null;

/**
 * Get ad service instance (singleton)
 */
export function getAdService(): AdService {
  if (!adServiceInstance) {
    adServiceInstance = new AdService();
  }
  return adServiceInstance;
}

// Also export as default instance for convenience
export const adService = getAdService();
