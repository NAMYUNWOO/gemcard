/**
 * Ad Service
 *
 * Manages interstitial ads for gem replacement using Toss Ads (Google AdMob).
 * Users must watch an interstitial ad before replacing a gem in an occupied slot.
 *
 * Flow: 다시 뽑기 요청 → 전면 광고 시청 → 뽑기 진행
 */

import { isInTossWebView } from '../../utils/environment';

/**
 * Ad Group IDs
 * - 전면형 광고: ait-ad-test-interstitial-id (테스트)
 * - 보상형 광고: ait-ad-test-rewarded-id (사용 안 함)
 */
const TEST_AD_GROUP_ID = 'ait-ad-test-interstitial-id';
// const PROD_AD_GROUP_ID = 'YOUR_PRODUCTION_AD_GROUP_ID'; // TODO: 콘솔에서 발급받은 전면 광고 그룹 ID로 교체

/**
 * Get ad group ID based on environment
 */
function getAdGroupId(): string {
  // TODO: 프로덕션 광고 등록 후 조건부 로직 활성화
  // try {
  //   const env = getOperationalEnvironment();
  //   if (env === 'toss') {
  //     return PROD_AD_GROUP_ID;
  //   }
  // } catch {
  //   // Framework not available
  // }
  return TEST_AD_GROUP_ID;
}

const AD_GROUP_ID = getAdGroupId();

/**
 * Ad Service for managing interstitial ads
 */
export class AdService {
  private adLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Preload interstitial ad for faster display
   * Call this when entering a page where ad might be needed
   */
  async preloadAd(): Promise<void> {
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
      if (GoogleAdMob.loadAppsInTossAdMob?.isSupported && !GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
        console.log('[AdService] Interstitial ads not supported in this environment');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID,
          },
          onEvent: (event) => {
            if (event.type === 'loaded') {
              this.adLoaded = true;
              console.log('[AdService] Interstitial ad preloaded successfully');
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
   * Show interstitial ad for gem replacement
   * 전면 광고는 시청 완료 여부와 관계없이 닫히면 진행 허용
   * @returns true if ad was shown (or skipped in non-Toss), false if failed to show
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!isInTossWebView()) {
      // In non-Toss environment, allow action without ad
      console.log('[AdService] Not in Toss WebView, skipping ad requirement');
      return true;
    }

    // If ad not loaded, try to load it first
    if (!this.adLoaded) {
      await this.preloadAd();

      if (!this.adLoaded) {
        // Ad failed to load, allow action anyway for better UX
        console.warn('[AdService] Ad not available, allowing action');
        return true;
      }
    }

    try {
      const { GoogleAdMob } = await import('@apps-in-toss/web-framework');

      // Check if supported
      if (GoogleAdMob.showAppsInTossAdMob?.isSupported && !GoogleAdMob.showAppsInTossAdMob.isSupported()) {
        console.log('[AdService] Showing interstitial ads not supported');
        return true;
      }

      const result = await new Promise<boolean>((resolve) => {
        GoogleAdMob.showAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID,
          },
          onEvent: (event) => {
            console.log('[AdService] showAppsInTossAdMob event:', event.type);
            if (event.type === 'show') {
              console.log('[AdService] Interstitial ad shown');
            }
            if (event.type === 'dismissed') {
              // 전면 광고는 닫히면 바로 진행 허용
              console.log('[AdService] Ad dismissed, proceeding with action');
              resolve(true);
            }
          },
          onError: (error) => {
            console.error('[AdService] Failed to show ad:', error);
            resolve(true); // Allow action on error for better UX
          },
        });
      });

      // Reset loaded state after showing
      this.adLoaded = false;

      // Preload next ad in background
      this.preloadAd();

      return result;
    } catch (error) {
      console.error('[AdService] Failed to show ad:', error);
      this.adLoaded = false;

      // On error, allow action for better UX
      return true;
    }
  }

  /**
   * @deprecated Use showInterstitialAd instead
   */
  async showRewardedAd(): Promise<boolean> {
    return this.showInterstitialAd();
  }

  /**
   * @deprecated Use preloadAd instead
   */
  async preloadRewardedAd(): Promise<void> {
    return this.preloadAd();
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
