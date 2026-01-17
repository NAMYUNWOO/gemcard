/**
 * useBackEvent Hook
 *
 * Handles back button events in apps-in-toss WebView.
 * - Direct scheme entry → close app (closeView)
 * - In-app navigation → go back (navigate(-1))
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Check if running inside apps-in-toss WebView (ReactNativeWebView available)
 */
function isInWebView(): boolean {
  return typeof window !== 'undefined' && 'ReactNativeWebView' in window;
}

export function useBackEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only register back event handler in apps-in-toss WebView
    if (!isInWebView()) {
      return;
    }

    // Dynamic import to avoid errors in browser environment
    import('@apps-in-toss/web-framework').then(({ bedrockEvent, closeView }) => {
      cleanupRef.current = bedrockEvent.addEventListener('backEvent', {
        onEvent: () => {
          // location.key === 'default' means direct entry via scheme
          if (location.key === 'default') {
            closeView();  // Close the app
          } else {
            navigate(-1); // Go to previous page
          }
        },
        onError: (error: Error) => console.error('Back event error:', error),
      });
    }).catch((error) => {
      console.error('Failed to load web-framework:', error);
    });

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [location.key, navigate]);
}
