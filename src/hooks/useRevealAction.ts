/**
 * useRevealAction Hook
 *
 * Flexible hook for handling spoiler reveal actions.
 * Currently supports sharing, with easy extension for ads or custom conditions.
 */

import { useCallback } from 'react';
import type { MagicGem } from '../types/gem';
import { generateShareUrl } from '../utils/gemShare';

// =============================================================================
// Types
// =============================================================================

type RevealActionType = 'none' | 'share' | 'ad' | 'custom';

interface UseRevealActionOptions {
  gem: MagicGem | null;
  onSuccess: () => void;
}

interface UseRevealActionResult {
  executeAction: () => Promise<void>;
  actionType: RevealActionType;
  actionLabel: string;
}

// =============================================================================
// Action Executors
// =============================================================================

async function executeShareAction(gem: MagicGem): Promise<boolean> {
  const shareUrl = generateShareUrl(gem);

  if (navigator.share) {
    try {
      await navigator.share({
        title: gem.name,
        text: `I summoned ${gem.name}!`,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      // User cancelled share - don't reveal
      if (err instanceof Error && err.name === 'AbortError') {
        return false;
      }
      // Other error - fall back to clipboard
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch {
    return false;
  }
}

// TODO: Implement ad action when needed
// async function executeAdAction(): Promise<boolean> {
//   // Show rewarded ad
//   // return true if ad was watched successfully
//   return false;
// }

// =============================================================================
// Hook
// =============================================================================

// Configuration - change this to switch reveal behavior
const CURRENT_ACTION_TYPE: RevealActionType = 'none';

// Labels for UI hints
const ACTION_LABELS: Record<RevealActionType, string> = {
  none: 'Tap to reveal',
  share: 'Tap to share and reveal',
  ad: 'Watch ad to reveal',
  custom: 'Complete action to reveal',
};

// Action executors map
const ACTION_EXECUTORS: Record<RevealActionType, (gem: MagicGem) => Promise<boolean>> = {
  none: async () => true, // 즉시 reveal
  share: executeShareAction,
  ad: async () => {
    // TODO: Add ad logic
    return false;
  },
  custom: async () => {
    // TODO: Add custom logic
    return false;
  },
};

export function useRevealAction({
  gem,
  onSuccess,
}: UseRevealActionOptions): UseRevealActionResult {
  const executeAction = useCallback(async () => {
    if (!gem) return;

    const executor = ACTION_EXECUTORS[CURRENT_ACTION_TYPE];
    const success = await executor(gem);

    if (success) {
      onSuccess();
    }
  }, [gem, onSuccess]);

  return {
    executeAction,
    actionType: CURRENT_ACTION_TYPE,
    actionLabel: ACTION_LABELS[CURRENT_ACTION_TYPE],
  };
}
