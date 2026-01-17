/**
 * Environment Detection Utilities
 *
 * Detects whether the app is running in App in Toss WebView or regular browser.
 * Uses @apps-in-toss/web-framework's isSupported API for reliable detection.
 */

/**
 * Toss WebView domains
 * - Production: *.apps.tossmini.com
 * - Development: *.private-apps.tossmini.com
 */
const TOSS_DOMAINS = ['.apps.tossmini.com', '.private-apps.tossmini.com'];

/**
 * Cached result of framework API support check
 * - null: not yet checked
 * - true/false: checked result
 */
let frameworkSupportedCache: boolean | null = null;

/**
 * Check if hostname matches Toss WebView domains
 */
function isDomainTossWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return TOSS_DOMAINS.some((domain) => hostname.endsWith(domain));
}

/**
 * Initialize environment detection using framework API
 * Call this early in app lifecycle for accurate detection in test environments
 *
 * Uses GoogleAdMob.loadAdMobRewardedAd.isSupported() which is available
 * in both production Toss WebView and test environments (QR scan)
 */
export async function initializeEnvironmentDetection(): Promise<void> {
  if (frameworkSupportedCache !== null) return;

  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    // isSupported returns true when running in Toss WebView (including test via QR)
    const isSupported = GoogleAdMob?.loadAdMobRewardedAd?.isSupported;
    frameworkSupportedCache = typeof isSupported === 'function' && isSupported();
    console.log('[Environment] Toss WebView detected:', frameworkSupportedCache);
  } catch {
    frameworkSupportedCache = false;
    console.log('[Environment] Framework not available, using browser mode');
  }
}

/**
 * Check if app is running inside App in Toss WebView
 *
 * Detection methods (in order):
 * 1. Framework API isSupported check (works in test environment via QR)
 * 2. Domain-based check (production fallback)
 */
export function isInTossWebView(): boolean {
  if (typeof window === 'undefined') return false;

  // If framework check completed, use that result
  if (frameworkSupportedCache !== null) {
    return frameworkSupportedCache;
  }

  // Fallback to domain check (for sync calls before init)
  return isDomainTossWebView();
}

/**
 * App environment type
 */
export type AppEnvironment = 'toss-webview' | 'web-browser';

/**
 * Detect current app environment
 */
export function detectEnvironment(): AppEnvironment {
  return isInTossWebView() ? 'toss-webview' : 'web-browser';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Determine whether to use Firebase (Firestore) for storage
 *
 * Strategy:
 * - Production: Only use Firebase when running in Toss WebView (origin check)
 * - Development: Use Firebase if VITE_USE_FIREBASE=true (for testing)
 *
 * @returns true if Firebase should be used, false for localStorage
 */
export function shouldUseFirebase(): boolean {
  // In production, strictly check origin (Toss WebView only)
  if (isProduction()) {
    return isInTossWebView();
  }

  // In development, allow Firebase usage via environment variable
  const useFirebaseEnv = import.meta.env.VITE_USE_FIREBASE;
  if (useFirebaseEnv === 'true' || useFirebaseEnv === '1') {
    return true;
  }

  // Default: use localStorage in development
  return false;
}
