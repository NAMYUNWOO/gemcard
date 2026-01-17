/**
 * Firestore Service
 *
 * Implements GemStorageService using Firebase Firestore for persistence.
 * Used when app is running inside Toss WebView.
 *
 * Firestore Structure:
 * users/{uid}/
 *   - profile: { maxSlots, packsPurchased, activeSlot, lastUserInfo, powerDescRevealed }
 *   - gems/{gemId}: { ...MagicGem, slot, magicCircleId }
 */

import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import type { MagicGem, UserInfo, MagicCircle, LocalizedDescriptions } from '../../types/gem';
import { getMagicCircleById, MAGIC_CIRCLES } from '../../types/gem';
import type { GemStorageService } from './types';
import { STORAGE_CONSTANTS } from './types';

/**
 * Profile document structure
 */
interface ProfileDoc {
  maxSlots: number;
  packsPurchased: number;
  activeSlot: number;
  lastUserInfo: UserInfo | null;
  powerDescRevealed: boolean;
  createdAt: number;
  lastLoginAt: number;
}

/**
 * Gem document structure (Firestore-friendly)
 * MagicCircle is stored as ID only to reduce document size
 */
interface GemDoc {
  id: string;
  shape: string;
  color: string;
  turbidity: number;
  contrast: number;
  name: string;
  names?: LocalizedDescriptions;
  magicPower: MagicGem['magicPower'];
  rarity: string;
  magicCircleId: number; // Store only ID, not full object
  templateIndex?: number;
  userInfo?: UserInfo;
  obtainedAt: number;
  origin: string;
  slot: number;
}

/**
 * Convert MagicGem to Firestore document
 */
function gemToDoc(gem: MagicGem, slot: number): GemDoc {
  return {
    id: gem.id,
    shape: gem.shape,
    color: gem.color,
    turbidity: gem.turbidity,
    contrast: gem.contrast,
    name: gem.name,
    names: gem.names,
    magicPower: gem.magicPower,
    rarity: gem.rarity,
    magicCircleId: gem.magicCircle.id,
    templateIndex: gem.templateIndex,
    userInfo: gem.userInfo,
    obtainedAt: gem.obtainedAt,
    origin: gem.origin,
    slot,
  };
}

/**
 * Convert Firestore document to MagicGem
 */
function docToGem(doc: GemDoc): MagicGem {
  const magicCircle: MagicCircle = getMagicCircleById(doc.magicCircleId) ?? MAGIC_CIRCLES[0];

  return {
    id: doc.id,
    shape: doc.shape,
    color: doc.color,
    turbidity: doc.turbidity,
    contrast: doc.contrast,
    name: doc.name,
    names: doc.names,
    magicPower: doc.magicPower,
    rarity: doc.rarity as MagicGem['rarity'],
    magicCircle,
    templateIndex: doc.templateIndex,
    userInfo: doc.userInfo,
    obtainedAt: doc.obtainedAt,
    origin: doc.origin as MagicGem['origin'],
  };
}

/**
 * Firestore implementation of GemStorageService
 */
export class FirestoreService implements GemStorageService {
  private userId: string | null = null;
  private initialized = false;
  private profile: ProfileDoc | null = null;
  private gemsCache: Map<number, MagicGem> = new Map(); // slot -> gem

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Wait for auth state
    await new Promise<void>((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          unsubscribe();
          if (user) {
            this.userId = user.uid;
            resolve();
          } else {
            // Sign in anonymously
            try {
              const credential = await signInAnonymously(auth);
              this.userId = credential.user.uid;
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        },
        reject
      );
    });

    // Load profile
    await this.loadProfile();

    // Load gems
    await this.loadGems();

    this.initialized = true;
  }

  /**
   * Load or create user profile
   */
  private async loadProfile(): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const profileRef = doc(db, 'users', this.userId, 'profile', 'main');
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      this.profile = profileSnap.data() as ProfileDoc;
      // Update last login
      this.profile.lastLoginAt = Date.now();
      await setDoc(profileRef, this.profile, { merge: true });
    } else {
      // Create new profile
      this.profile = {
        maxSlots: STORAGE_CONSTANTS.BASE_SLOTS,
        packsPurchased: 0,
        activeSlot: 0,
        lastUserInfo: null,
        powerDescRevealed: false,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      await setDoc(profileRef, this.profile);
    }
  }

  /**
   * Load all gems from Firestore
   */
  private async loadGems(): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const gemsRef = collection(db, 'users', this.userId, 'gems');
    const gemsSnap = await getDocs(gemsRef);

    this.gemsCache.clear();
    gemsSnap.forEach((doc) => {
      const gemDoc = doc.data() as GemDoc;
      this.gemsCache.set(gemDoc.slot, docToGem(gemDoc));
    });
  }

  /**
   * Persist profile to Firestore
   */
  private async persistProfile(): Promise<void> {
    if (!this.userId || !this.profile) return;

    const profileRef = doc(db, 'users', this.userId, 'profile', 'main');
    await setDoc(profileRef, this.profile, { merge: true });
  }

  // =============================================================================
  // Gem Operations
  // =============================================================================

  async getGems(): Promise<MagicGem[]> {
    return Array.from(this.gemsCache.values());
  }

  async getActiveGem(): Promise<MagicGem | null> {
    if (!this.profile) return null;
    return this.gemsCache.get(this.profile.activeSlot) ?? null;
  }

  async getGemAtSlot(slot: number): Promise<MagicGem | null> {
    return this.gemsCache.get(slot) ?? null;
  }

  async setGem(gem: MagicGem, slot: number): Promise<void> {
    if (!this.userId || !this.profile) throw new Error('Not authenticated');

    if (slot < 0 || slot >= this.profile.maxSlots) {
      throw new Error(`Invalid slot: ${slot}. Max slots: ${this.profile.maxSlots}`);
    }

    // Delete existing gem at slot if any
    const existingGem = this.gemsCache.get(slot);
    if (existingGem) {
      const oldGemRef = doc(db, 'users', this.userId, 'gems', existingGem.id);
      await deleteDoc(oldGemRef);
    }

    // Save new gem
    const gemRef = doc(db, 'users', this.userId, 'gems', gem.id);
    await setDoc(gemRef, gemToDoc(gem, slot));

    // Update cache
    this.gemsCache.set(slot, gem);

    // Update profile
    this.profile.activeSlot = slot;
    this.profile.powerDescRevealed = false;
    await this.persistProfile();
  }

  async deleteGem(gemId: string): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    // Find slot by gem ID
    let slotToDelete: number | null = null;
    for (const [slot, gem] of this.gemsCache.entries()) {
      if (gem.id === gemId) {
        slotToDelete = slot;
        break;
      }
    }

    if (slotToDelete === null) return;

    // Delete from Firestore
    const gemRef = doc(db, 'users', this.userId, 'gems', gemId);
    await deleteDoc(gemRef);

    // Update cache
    this.gemsCache.delete(slotToDelete);
  }

  async setActiveSlot(slot: number): Promise<void> {
    if (!this.profile) throw new Error('Not initialized');

    if (slot < 0 || slot >= this.profile.maxSlots) {
      throw new Error(`Invalid slot: ${slot}. Max slots: ${this.profile.maxSlots}`);
    }

    this.profile.activeSlot = slot;
    await this.persistProfile();
  }

  async getActiveSlot(): Promise<number> {
    return this.profile?.activeSlot ?? 0;
  }

  // =============================================================================
  // Slot Management
  // =============================================================================

  async getMaxSlots(): Promise<number> {
    return this.profile?.maxSlots ?? STORAGE_CONSTANTS.BASE_SLOTS;
  }

  async setMaxSlots(slots: number): Promise<void> {
    if (!this.profile) throw new Error('Not initialized');

    this.profile.maxSlots = Math.min(
      Math.max(slots, STORAGE_CONSTANTS.BASE_SLOTS),
      STORAGE_CONSTANTS.MAX_SLOTS
    );
    await this.persistProfile();
  }

  async getAvailableSlot(): Promise<number | null> {
    if (!this.profile) return null;

    for (let i = 0; i < this.profile.maxSlots; i++) {
      if (!this.gemsCache.has(i)) {
        return i;
      }
    }
    return null;
  }

  // =============================================================================
  // Purchase Tracking
  // =============================================================================

  async getPacksPurchased(): Promise<number> {
    return this.profile?.packsPurchased ?? 0;
  }

  async setPacksPurchased(count: number): Promise<void> {
    if (!this.profile) throw new Error('Not initialized');

    this.profile.packsPurchased = Math.min(
      Math.max(count, 0),
      STORAGE_CONSTANTS.MAX_PACK_PURCHASES
    );
    await this.persistProfile();
  }

  // =============================================================================
  // User Info
  // =============================================================================

  async getLastUserInfo(): Promise<UserInfo | null> {
    return this.profile?.lastUserInfo ?? null;
  }

  async setLastUserInfo(info: UserInfo): Promise<void> {
    if (!this.profile) throw new Error('Not initialized');

    this.profile.lastUserInfo = info;
    await this.persistProfile();
  }

  // =============================================================================
  // Spoiler State
  // =============================================================================

  async getPowerDescRevealed(): Promise<boolean> {
    return this.profile?.powerDescRevealed ?? false;
  }

  async setPowerDescRevealed(revealed: boolean): Promise<void> {
    if (!this.profile) throw new Error('Not initialized');

    this.profile.powerDescRevealed = revealed;
    await this.persistProfile();
  }
}
