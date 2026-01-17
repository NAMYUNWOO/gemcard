/**
 * useAuth Hook
 *
 * Provides authentication state management.
 * Handles Firebase auth and Toss user identity.
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuthService } from '../services/auth/TossAuthService';

/**
 * Auth state
 */
interface AuthState {
  /** Current user ID (null if not authenticated) */
  userId: string | null;
  /** Whether auth is initialized */
  initialized: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Error if auth failed */
  error: Error | null;
  /** Retry authentication */
  retry: () => void;
}

/**
 * Hook to access authentication state
 *
 * @returns Auth state with user ID and initialization status
 *
 * @example
 * const { userId, isAuthenticated, initialized } = useAuth();
 *
 * if (!initialized) return <Loading />;
 * if (!isAuthenticated) return <Login />;
 *
 * console.log('User ID:', userId);
 */
export function useAuth(): AuthState {
  const [userId, setUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      const authService = getAuthService();
      const id = await authService.initialize();
      setUserId(id);
      setInitialized(true);
    } catch (e) {
      console.error('[useAuth] Initialization failed:', e);
      setError(e instanceof Error ? e : new Error('Failed to initialize auth'));
      setInitialized(true); // Mark as initialized even on error
    }
  }, []);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize, retryCount]);

  return {
    userId,
    initialized,
    isAuthenticated: userId !== null,
    error,
    retry,
  };
}
