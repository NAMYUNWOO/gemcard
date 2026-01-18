/**
 * Environment Detection Utilities
 *
 * Detects whether the app is running in App in Toss WebView or regular browser.
 * Used to determine storage strategy (TossStorage vs localStorage).
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
