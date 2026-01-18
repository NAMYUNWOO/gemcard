/**
 * Environment Detection Utilities
 *
 * Detects whether the app is running in App in Toss WebView or regular browser.
 * Used to determine storage strategy (Firestore vs localStorage).
 *
 * Note: Domain-based detection doesn't work in QR code test environments.
 * We use getOperationalEnvironment() API for accurate detection.
 *
 * This module uses static import and initializes synchronously at module load
 * to ensure detection is complete before any component renders.
 */

import { getOperationalEnvironment } from '@apps-in-toss/web-framework';

/**
 * Toss WebView domains
 * - Production: *.apps.tossmini.com
 * - Development: *.private-apps.tossmini.com
 */
const TOSS_DOMAINS = ['.apps.tossmini.com', '.private-apps.tossmini.com'];

/**
 * Cache for framework API-based detection result
 * - null: not yet detected
 * - true/false: detection result
 */
let frameworkSupportedCache: boolean | null = null;

// Synchronous initialization at module load
try {
  const env = getOperationalEnvironment();
  frameworkSupportedCache = env === 'toss' || env === 'sandbox';
  console.log('[Environment] Framework detection:', env, '→', frameworkSupportedCache);
} catch {
  console.log('[Environment] Framework not available, using domain fallback');
  frameworkSupportedCache = null;
}

/**
 * Check if hostname matches Toss WebView domains
 */
function isDomainTossWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return TOSS_DOMAINS.some((domain) => hostname.endsWith(domain));
}

/**
 * Check if app is running inside App in Toss WebView
 * Uses framework API result if available, falls back to domain check
 */
export function isInTossWebView(): boolean {
  // Prefer framework API detection (works in QR code test environments)
  if (frameworkSupportedCache !== null) {
    return frameworkSupportedCache;
  }
  // Fallback to domain-based detection
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
