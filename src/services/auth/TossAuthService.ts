/**
 * Toss Auth Service
 *
 * Manages user authentication in Toss WebView environment.
 * Uses Toss Storage to persist a unique user key.
 *
 * NOTE: In the initial implementation, we use Firebase Anonymous Auth.
 * When a backend is available, this can be upgraded to Firebase Custom Auth
 * with a server-issued token.
 */

import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { isInTossWebView } from '../../utils/environment';

/** Storage key for Toss user key */
const TOSS_USER_KEY = 'gemcard-toss-user-key';

/**
 * Toss Auth Service
 *
 * Handles user authentication for the app.
 * In Toss WebView, uses Toss Storage to persist user identity across sessions.
 * In regular browser, uses Firebase Anonymous Auth directly.
 */
export class TossAuthService {
  private userId: string | null = null;
  private initialized = false;

  /**
   * Initialize authentication
   * @returns User ID after authentication
   */
  async initialize(): Promise<string> {
    if (this.initialized && this.userId) {
      return this.userId;
    }

    if (isInTossWebView()) {
      return this.initializeTossAuth();
    } else {
      return this.initializeBrowserAuth();
    }
  }

  /**
   * Initialize auth for Toss WebView environment
   */
  private async initializeTossAuth(): Promise<string> {
    try {
      // Try to import Toss Storage dynamically
      const { Storage } = await import('@apps-in-toss/web-framework');

      // Check for existing user key in Toss Storage
      let userKey = await Storage.getItem(TOSS_USER_KEY);

      if (!userKey) {
        // Generate new user key
        userKey = crypto.randomUUID();
        await Storage.setItem(TOSS_USER_KEY, userKey);
        console.log('[TossAuth] Created new user key');
      } else {
        console.log('[TossAuth] Retrieved existing user key');
      }

      // Sign in with Firebase Anonymous Auth
      // NOTE: In future, replace with Custom Auth using userKey as identifier
      const credential = await signInAnonymously(auth);
      this.userId = credential.user.uid;
      this.initialized = true;

      console.log('[TossAuth] Authenticated with Firebase:', this.userId);
      return this.userId;
    } catch (e) {
      console.error('[TossAuth] Failed to initialize Toss auth:', e);
      // Fall back to browser auth
      return this.initializeBrowserAuth();
    }
  }

  /**
   * Initialize auth for regular browser environment
   */
  private async initializeBrowserAuth(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if already signed in
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          unsubscribe();

          if (user) {
            this.userId = user.uid;
            this.initialized = true;
            resolve(this.userId);
          } else {
            try {
              const credential = await signInAnonymously(auth);
              this.userId = credential.user.uid;
              this.initialized = true;
              console.log('[TossAuth] Anonymous auth successful:', this.userId);
              resolve(this.userId);
            } catch (e) {
              console.error('[TossAuth] Anonymous auth failed:', e);
              reject(e);
            }
          }
        },
        reject
      );
    });
  }

  /**
   * Get current user ID
   * @returns User ID or null if not authenticated
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.initialized && this.userId !== null;
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
}

// Singleton instance
let authServiceInstance: TossAuthService | null = null;

/**
 * Get the auth service instance (singleton)
 */
export function getAuthService(): TossAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new TossAuthService();
  }
  return authServiceInstance;
}
