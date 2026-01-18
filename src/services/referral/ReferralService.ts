/**
 * Referral Service
 *
 * Manages friend invitation via Toss contactsViral API for slot expansion.
 * When a user successfully shares to a friend, they earn +1 slot (up to max 10).
 *
 * Note: contactsViral is only available in Toss WebView.
 * Reward configuration is done in Toss developer console.
 */

import { isInTossWebView } from '../../utils/environment';
import { STORAGE_CONSTANTS } from '../storage/types';

/**
 * Referral Service class using Toss contactsViral API
 */
export class ReferralService {
  private cleanup: (() => void) | null = null;

  /**
   * Open the friend invitation screen (Toss contactsViral)
   * Reward info configured in Toss console is automatically displayed
   *
   * @param moduleId - The module ID from Toss console for this reward campaign
   * @param onRewardEarned - Callback when user successfully shares to a friend
   * @param onClose - Callback when the module closes
   */
  async openInviteFriends(
    moduleId: string,
    onRewardEarned: (amount: number, unit: string) => void,
    onClose?: (totalSent: number) => void
  ): Promise<void> {
    if (!isInTossWebView()) {
      console.warn('[Referral] contactsViral is only available in Toss WebView');
      return;
    }

    try {
      // Dynamic import to avoid issues in non-Toss environments
      const { contactsViral } = await import('@apps-in-toss/web-framework');

      this.cleanup = contactsViral({
        options: { moduleId },
        onEvent: (event) => {
          if (event.type === 'sendViral') {
            // User successfully shared to a friend
            onRewardEarned(event.data.rewardAmount, event.data.rewardUnit);
            console.log('[Referral] Reward earned:', event.data.rewardAmount, event.data.rewardUnit);
          } else if (event.type === 'close') {
            // Module closed
            onClose?.(event.data.sentRewardsCount);
            console.log('[Referral] Module closed. Total sent:', event.data.sentRewardsCount);
            this.cleanup?.();
            this.cleanup = null;
          }
        },
        onError: (error) => {
          console.error('[Referral] contactsViral error:', error);
          this.cleanup?.();
          this.cleanup = null;
        },
      });
    } catch (error) {
      console.error('[Referral] Failed to initialize contactsViral:', error);
    }
  }

  /**
   * Manually close the contacts viral module
   */
  close(): void {
    this.cleanup?.();
    this.cleanup = null;
  }

  /**
   * Check if user can receive more referral rewards
   */
  canReceiveReferral(currentMaxSlots: number): boolean {
    return currentMaxSlots < STORAGE_CONSTANTS.MAX_SLOTS;
  }
}

// Singleton instance
let referralServiceInstance: ReferralService | null = null;

/**
 * Get the referral service instance (singleton)
 */
export function getReferralService(): ReferralService {
  if (!referralServiceInstance) {
    referralServiceInstance = new ReferralService();
  }
  return referralServiceInstance;
}

// Export singleton instance for convenience
export const referralService = getReferralService();
