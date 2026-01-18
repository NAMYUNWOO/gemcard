/**
 * SummonModal Component
 *
 * Modal overlay for gem summoning with user info form.
 * Supports multi-slot system with ad-based replacement.
 */

import { useState, useCallback, useEffect } from 'react';
import { StarField } from '../StarField';
import { SummonCircle } from '../SummonCircle';
import { MagicButton } from '../MagicButton';
import { generateMagicGem } from '../../utils/gemGenerator';
import { useGemStore } from '../../stores/gemStore';
import type { UserInfo, Gender, BirthDateTime } from '../../types/gem';
import { GENDER_LABELS, isValidUserInfo, getLocalizedName, getGenderLabel } from '../../types/gem';
import { useLocale } from '../../hooks';
import { useTranslation } from '../../i18n';
import { adService } from '../../services/ads/AdService';
import { isInTossWebView } from '../../utils/environment';
import styles from './SummonModal.module.css';

// =============================================================================
// Input Validation & Sanitization
// =============================================================================

const MAX_NAME_LENGTH = 50;

/**
 * Sanitize name input - remove dangerous characters, limit length
 * Allows: letters (any language), numbers, spaces, hyphens, apostrophes
 */
function sanitizeName(input: string): string {
  return input
    .slice(0, MAX_NAME_LENGTH)
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-like patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Keep only safe characters: letters, numbers, spaces, common punctuation
    .replace(/[^\p{L}\p{N}\s\-'·]/gu, '')
    .trim();
}

/**
 * Validate and clamp numeric input within range
 */
function clampNumber(value: string, min: number, max: number): string {
  if (value === '') return '';
  const num = parseInt(value, 10);
  if (isNaN(num)) return '';
  if (num < min) return String(min);
  if (num > max) return String(max);
  return String(num);
}

/**
 * Validate year is reasonable (1900-current year)
 */
function validateYear(value: string): string {
  if (value === '') return '';
  const currentYear = new Date().getFullYear();
  return clampNumber(value, 1900, currentYear);
}

/**
 * Validate month (1-12)
 */
function validateMonth(value: string): string {
  return clampNumber(value, 1, 12);
}

/**
 * Validate day (1-31)
 */
function validateDay(value: string): string {
  return clampNumber(value, 1, 31);
}

/**
 * Validate hour (0-23)
 */
function validateHour(value: string): string {
  return clampNumber(value, 0, 23);
}

/**
 * Validate minute/second (0-59)
 */
function validateMinuteSecond(value: string): string {
  return clampNumber(value, 0, 59);
}

type SummonState = 'form' | 'confirm-replace' | 'watching-ad' | 'summoning';

interface SummonModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: number;
  isReplacing: boolean;
  onSummonComplete?: () => void;
}

export function SummonModal({ isOpen, onClose, targetSlot, isReplacing, onSummonComplete }: SummonModalProps) {
  const {
    gems,
    maxSlots,
    setGemAtSlot,
    lastUserInfo,
    setLastUserInfo,
    setPowerDescRevealed,
    getAllGems,
  } = useGemStore();
  const locale = useLocale();
  const t = useTranslation();

  const [state, setState] = useState<SummonState>('form');
  const [summoningMessageIndex, setSummoningMessageIndex] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthHour, setBirthHour] = useState<string>('');
  const [birthMinute, setBirthMinute] = useState<string>('');
  const [birthSecond, setBirthSecond] = useState<string>('');
  const [formError, setFormError] = useState('');

  const allGems = getAllGems();
  const gemCount = allGems.length;
  const currentGemToReplace = gems[targetSlot];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState(isReplacing ? 'confirm-replace' : 'form');
      setFormError('');
    }
  }, [isOpen, isReplacing]);

  // Preload ad when modal opens (if in Toss WebView)
  useEffect(() => {
    if (isOpen && isInTossWebView()) {
      adService.preloadRewardedAd();
    }
  }, [isOpen]);

  // Randomly select summoning message when summoning starts
  useEffect(() => {
    if (state === 'summoning') {
      const randomIndex = Math.floor(Math.random() * t.summoningMessages.length);
      setSummoningMessageIndex(randomIndex);
    }
  }, [state, t.summoningMessages.length]);

  // Pre-fill form with last user info
  useEffect(() => {
    if (lastUserInfo) {
      if (lastUserInfo.name) setName(lastUserInfo.name);
      if (lastUserInfo.gender) setGender(lastUserInfo.gender);
      if (lastUserInfo.birthdate?.date) {
        const [y, m, d] = lastUserInfo.birthdate.date.split('-');
        setBirthYear(y || '');
        setBirthMonth(m ? String(parseInt(m, 10)) : ''); // Remove leading zeros
        setBirthDay(d ? String(parseInt(d, 10)) : '');   // Remove leading zeros
        if (lastUserInfo.birthdate.hour !== undefined) {
          setBirthHour(String(lastUserInfo.birthdate.hour));
        }
        if (lastUserInfo.birthdate.minute !== undefined) {
          setBirthMinute(String(lastUserInfo.birthdate.minute));
        }
        if (lastUserInfo.birthdate.second !== undefined) {
          setBirthSecond(String(lastUserInfo.birthdate.second));
        }
      }
    }
  }, [lastUserInfo]);

  // Build UserInfo from form (with final sanitization)
  const buildUserInfo = useCallback((): UserInfo => {
    const sanitizedName = sanitizeName(name);

    // Validate date components
    const validYear = validateYear(birthYear);
    const validMonth = validateMonth(birthMonth);
    const validDay = validateDay(birthDay);

    const birthdate: BirthDateTime | undefined = (validYear && validMonth && validDay)
      ? {
          date: `${validYear.padStart(4, '0')}-${validMonth.padStart(2, '0')}-${validDay.padStart(2, '0')}`,
          ...(birthHour !== '' && { hour: parseInt(validateHour(birthHour) || '0', 10) }),
          ...(birthMinute !== '' && { minute: parseInt(validateMinuteSecond(birthMinute) || '0', 10) }),
          ...(birthSecond !== '' && { second: parseInt(validateMinuteSecond(birthSecond) || '0', 10) }),
        }
      : undefined;

    return {
      ...(sanitizedName && { name: sanitizedName }),
      ...(gender && { gender }),
      ...(birthdate && { birthdate }),
    };
  }, [name, gender, birthYear, birthMonth, birthDay, birthHour, birthMinute, birthSecond]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const userInfo = buildUserInfo();
    if (!isValidUserInfo(userInfo)) {
      setFormError(t.formError);
      return false;
    }
    setFormError('');
    return true;
  }, [buildUserInfo, t.formError]);

  // Start the summoning process
  const startSummoning = useCallback(async () => {
    setState('summoning');
    setPowerDescRevealed(false); // Reset spoiler state for new gem

    const userInfo = buildUserInfo();

    // Save user info for next time
    setLastUserInfo(userInfo);

    // Collect owned template indices to avoid duplicates
    const ownedTemplateIndices = allGems
      .map((gem) => gem.templateIndex)
      .filter((idx): idx is number => idx !== undefined);

    // Generate gem with user info, excluding already owned templates
    const gem = await generateMagicGem('gacha', userInfo, ownedTemplateIndices);

    // Delay for animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save gem to slot
    setGemAtSlot(gem, targetSlot);

    // Notify completion
    onClose();
    onSummonComplete?.();
  }, [
    buildUserInfo,
    setLastUserInfo,
    setPowerDescRevealed,
    setGemAtSlot,
    allGems,
    targetSlot,
    onClose,
    onSummonComplete,
  ]);

  // Handle form submission
  const handleFormSubmit = useCallback(() => {
    if (!validateForm()) return;

    if (isReplacing) {
      setState('confirm-replace');
    } else {
      startSummoning();
    }
  }, [validateForm, isReplacing, startSummoning]);

  // Cancel replacement
  const handleCancelReplace = useCallback(() => {
    if (isReplacing) {
      // If we started with replace confirmation, close the modal
      onClose();
    } else {
      // Otherwise go back to form
      setState('form');
    }
  }, [isReplacing, onClose]);

  // Confirm replacement (with interstitial ad for Toss environment)
  const handleConfirmReplace = useCallback(async () => {
    // If replacing a gem, show interstitial ad first (in Toss environment)
    if (isReplacing && isInTossWebView()) {
      setState('watching-ad');

      // 전면 광고 시청 후 진행
      await adService.showInterstitialAd();
    }

    // Ad shown or not required - proceed with summoning
    startSummoning();
  }, [isReplacing, startSummoning]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <StarField />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>
          <span className={styles.closeIcon}>{'<'}</span>
          <span>{t.replaceCancel}</span>
        </button>
        {gemCount > 0 && (
          <span className={styles.slotInfo}>
            {gemCount} / {maxSlots}
          </span>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Form State */}
        {state === 'form' && (
          <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>{t.gachaTitle}</h1>
            <p className={styles.formSubtitle}>
              "{t.gachaSubtitle}"
            </p>

            <div className={styles.form}>
              {/* Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{t.formName}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(sanitizeName(e.target.value))}
                  placeholder={t.formNamePlaceholder}
                  maxLength={MAX_NAME_LENGTH}
                  autoComplete="off"
                />
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{t.formGender}</label>
                <select
                  className={styles.select}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                >
                  <option value="">{t.formSelectGender}</option>
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                    <option key={g} value={g}>
                      {getGenderLabel(g, locale)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Birth Date (Year / Month / Day) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{t.formBirthDate}</label>
                <div className={styles.dateInputs}>
                  <input
                    type="number"
                    className={styles.dateInput}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value.slice(0, 4))}
                    onBlur={(e) => setBirthYear(validateYear(e.target.value))}
                    placeholder={t.formYear}
                    min="1900"
                    max={new Date().getFullYear()}
                    inputMode="numeric"
                  />
                  <span className={styles.dateSeparator}>/</span>
                  <input
                    type="number"
                    className={styles.dateInputSmall}
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value.slice(0, 2))}
                    onBlur={(e) => setBirthMonth(validateMonth(e.target.value))}
                    placeholder={t.formMonth}
                    min="1"
                    max="12"
                    inputMode="numeric"
                  />
                  <span className={styles.dateSeparator}>/</span>
                  <input
                    type="number"
                    className={styles.dateInputSmall}
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value.slice(0, 2))}
                    onBlur={(e) => setBirthDay(validateDay(e.target.value))}
                    placeholder={t.formDay}
                    min="1"
                    max="31"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Time (Hour, Minute, Second) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{t.formBirthTime} ({t.formOptional})</label>
                <div className={styles.timeInputs}>
                  <input
                    type="number"
                    className={styles.timeInput}
                    value={birthHour}
                    onChange={(e) => setBirthHour(e.target.value.slice(0, 2))}
                    onBlur={(e) => setBirthHour(validateHour(e.target.value))}
                    placeholder={t.formHour}
                    min="0"
                    max="23"
                    inputMode="numeric"
                  />
                  <span className={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    className={styles.timeInput}
                    value={birthMinute}
                    onChange={(e) => setBirthMinute(e.target.value.slice(0, 2))}
                    onBlur={(e) => setBirthMinute(validateMinuteSecond(e.target.value))}
                    placeholder={t.formMinute}
                    min="0"
                    max="59"
                    inputMode="numeric"
                  />
                  <span className={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    className={styles.timeInput}
                    value={birthSecond}
                    onChange={(e) => setBirthSecond(e.target.value.slice(0, 2))}
                    onBlur={(e) => setBirthSecond(validateMinuteSecond(e.target.value))}
                    placeholder={t.formSecond}
                    min="0"
                    max="59"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {formError && (
                <p className={styles.formError}>{formError}</p>
              )}

              <p className={styles.formHint}>
                {t.formError}
              </p>

              <div className={styles.formActions}>
                <MagicButton
                  onClick={onClose}
                  variant="secondary"
                  size="lg"
                >
                  {t.replaceCancel}
                </MagicButton>
                <MagicButton
                  onClick={handleFormSubmit}
                  size="lg"
                >
                  {t.summonButton}
                </MagicButton>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Replace State */}
        {state === 'confirm-replace' && (
          <div className={styles.confirmContainer}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h2 className={styles.confirmTitle}>{t.replaceTitle}</h2>
            <p className={styles.confirmText}>
              {t.replaceWarning}
            </p>
            <p className={styles.confirmWarning}>
              "{currentGemToReplace && getLocalizedName(currentGemToReplace, locale)}"
            </p>

            {isInTossWebView() && (
              <p className={styles.adNotice}>
                {t.adRequired}
              </p>
            )}

            <div className={styles.confirmActions}>
              <MagicButton
                onClick={handleCancelReplace}
                variant="secondary"
                size="md"
              >
                {t.replaceCancel}
              </MagicButton>
              <MagicButton
                onClick={handleConfirmReplace}
                size="md"
              >
                {t.replaceConfirm}
              </MagicButton>
            </div>
          </div>
        )}

        {/* Watching Ad State */}
        {state === 'watching-ad' && (
          <div className={styles.adContainer}>
            <div className={styles.adSpinner} />
            <p className={styles.adText}>{t.adRequired}</p>
          </div>
        )}

        {/* Summoning State */}
        {state === 'summoning' && (
          <>
            <div className={styles.circleWrapper}>
              <SummonCircle isActive isSummoning size={280} />
            </div>

            <p className={styles.summoningText}>
              "{t.summoningMessages[summoningMessageIndex]}"
            </p>
          </>
        )}
      </main>
    </div>
  );
}
