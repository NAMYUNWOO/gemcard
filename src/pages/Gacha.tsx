/**
 * Gacha Page (Summon Page)
 *
 * Mystical gem summoning experience with user info form.
 * In single-gem system, new summon replaces existing gem.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { SummonCircle } from '../components/SummonCircle';
import { MagicButton } from '../components/MagicButton';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { generateMagicGem } from '../utils/gemGenerator';
import { useGemStore } from '../stores/gemStore';
import type { MagicGem, UserInfo, Gender, BirthDateTime } from '../types/gem';
import { ELEMENT_ICONS, GENDER_LABELS, isValidUserInfo } from '../types/gem';
import styles from './Gacha.module.css';

type GachaState = 'form' | 'confirm-replace' | 'summoning' | 'revealed';

export function Gacha() {
  const navigate = useNavigate();
  const { currentGem, setGem, lastUserInfo, setLastUserInfo } = useGemStore();

  const [state, setState] = useState<GachaState>('form');
  const [summonedGem, setSummonedGem] = useState<MagicGem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [birthHour, setBirthHour] = useState<string>('');
  const [birthMinute, setBirthMinute] = useState<string>('');
  const [birthSecond, setBirthSecond] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Pre-fill form with last user info
  useEffect(() => {
    if (lastUserInfo) {
      if (lastUserInfo.name) setName(lastUserInfo.name);
      if (lastUserInfo.gender) setGender(lastUserInfo.gender);
      if (lastUserInfo.birthdate) {
        setBirthDate(lastUserInfo.birthdate.date || '');
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

  // Build UserInfo from form
  const buildUserInfo = useCallback((): UserInfo => {
    const birthdate: BirthDateTime | undefined = birthDate
      ? {
          date: birthDate,
          ...(birthHour !== '' && { hour: parseInt(birthHour, 10) }),
          ...(birthMinute !== '' && { minute: parseInt(birthMinute, 10) }),
          ...(birthSecond !== '' && { second: parseInt(birthSecond, 10) }),
        }
      : undefined;

    return {
      ...(name.trim() && { name: name.trim() }),
      ...(gender && { gender }),
      ...(birthdate && { birthdate }),
    };
  }, [name, gender, birthDate, birthHour, birthMinute, birthSecond]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const userInfo = buildUserInfo();
    if (!isValidUserInfo(userInfo)) {
      setFormError('Please fill in at least one field');
      return false;
    }
    setFormError('');
    return true;
  }, [buildUserInfo]);

  // Handle form submission
  const handleFormSubmit = useCallback(() => {
    if (!validateForm()) return;

    // If user already has a gem, show confirmation
    if (currentGem) {
      setState('confirm-replace');
    } else {
      startSummoning();
    }
  }, [validateForm, currentGem]);

  // Cancel replacement
  const handleCancelReplace = useCallback(() => {
    setState('form');
  }, []);

  // Confirm replacement
  const handleConfirmReplace = useCallback(() => {
    startSummoning();
  }, []);

  // Start the summoning process
  const startSummoning = useCallback(async () => {
    setState('summoning');

    const userInfo = buildUserInfo();

    // Save user info for next time
    setLastUserInfo(userInfo);

    // Generate gem with user info
    const gem = await generateMagicGem('gacha', userInfo);

    // Delay for animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSummonedGem(gem);
    setState('revealed');
  }, [buildUserInfo, setLastUserInfo]);

  // Accept the gem and go home
  const handleAccept = useCallback(() => {
    if (!summonedGem) return;

    setGem(summonedGem);
    navigate('/');
  }, [summonedGem, setGem, navigate]);

  // View gem details
  const handleViewDetails = useCallback(() => {
    if (!summonedGem) return;

    setGem(summonedGem);
    navigate(`/gem/${summonedGem.id}`);
  }, [summonedGem, setGem, navigate]);

  const gemParams = summonedGem
    ? {
        shape: summonedGem.shape,
        color: summonedGem.color,
        turbidity: summonedGem.turbidity,
        dispersion: 0.05,
        thickness: 1.5,
        detailLevel: 5,
      }
    : null;

  return (
    <div className={styles.container}>
      <StarField />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <span className={styles.backIcon}>{'<'}</span>
          <span>Home</span>
        </button>
        {currentGem && (
          <span className={styles.hasGem}>1 Gem Owned</span>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Form State */}
        {state === 'form' && (
          <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Summon Your Gem</h1>
            <p className={styles.formSubtitle}>
              "Share your essence to crystallize destiny..."
            </p>

            <div className={styles.form}>
              {/* Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <select
                  className={styles.select}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                >
                  <option value="">Select...</option>
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                    <option key={g} value={g}>
                      {GENDER_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Birth Date */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Birth Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              {/* Time (Hour, Minute, Second) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Birth Time (optional)</label>
                <div className={styles.timeInputs}>
                  <input
                    type="number"
                    className={styles.timeInput}
                    value={birthHour}
                    onChange={(e) => setBirthHour(e.target.value)}
                    placeholder="HH"
                    min="0"
                    max="23"
                  />
                  <span className={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    className={styles.timeInput}
                    value={birthMinute}
                    onChange={(e) => setBirthMinute(e.target.value)}
                    placeholder="MM"
                    min="0"
                    max="59"
                  />
                  <span className={styles.timeSeparator}>:</span>
                  <input
                    type="number"
                    className={styles.timeInput}
                    value={birthSecond}
                    onChange={(e) => setBirthSecond(e.target.value)}
                    placeholder="SS"
                    min="0"
                    max="59"
                  />
                </div>
              </div>

              {formError && (
                <p className={styles.formError}>{formError}</p>
              )}

              <p className={styles.formHint}>
                At least one field is required
              </p>

              <MagicButton
                onClick={handleFormSubmit}
                size="lg"
                className={styles.summonBtn}
              >
                Begin Summoning
              </MagicButton>
            </div>
          </div>
        )}

        {/* Confirm Replace State */}
        {state === 'confirm-replace' && (
          <div className={styles.confirmContainer}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h2 className={styles.confirmTitle}>Replace Existing Gem?</h2>
            <p className={styles.confirmText}>
              You already possess a gem. Summoning a new one will
              <strong> permanently replace </strong>
              your current gem.
            </p>
            <p className={styles.confirmWarning}>
              "{currentGem?.name}" will be lost forever.
            </p>
            <div className={styles.confirmActions}>
              <MagicButton
                onClick={handleCancelReplace}
                variant="secondary"
                size="md"
              >
                Keep Current Gem
              </MagicButton>
              <MagicButton
                onClick={handleConfirmReplace}
                size="md"
              >
                Replace Gem
              </MagicButton>
            </div>
          </div>
        )}

        {/* Summoning State */}
        {state === 'summoning' && (
          <>
            <div className={styles.circleWrapper}>
              <SummonCircle isActive isSummoning size={280} />
            </div>

            <p className={styles.summoningText}>
              "Ancient forces stir..."
            </p>
          </>
        )}

        {/* Revealed State */}
        {state === 'revealed' && summonedGem && gemParams && (
          <div className={styles.revealContainer}>
            {/* Gem Display */}
            <div className={styles.gemDisplay}>
              <GemScene
                params={gemParams}
                contrast={summonedGem.contrast}
                autoRotate
                dynamicBackground
                magicCircle={summonedGem.magicCircle?.id ?? 17}
              />
            </div>

            {/* Gem Info */}
            <div className={styles.gemInfo}>
              <RarityBadge rarity={summonedGem.rarity} size="lg" />

              <h2 className={styles.gemName}>{summonedGem.name}</h2>

              <p className={styles.cutName}>{summonedGem.cutName}</p>

              <div className={styles.magicPower}>
                {summonedGem.magicPower.element && (
                  <span className={styles.element}>
                    {ELEMENT_ICONS[summonedGem.magicPower.element]}
                  </span>
                )}
                <h3 className={styles.powerTitle}>
                  {summonedGem.magicPower.title}
                </h3>
                <p className={styles.powerDesc}>
                  "{summonedGem.magicPower.description}"
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <MagicButton
                onClick={handleAccept}
                variant="secondary"
                size="md"
              >
                Accept & Go Home
              </MagicButton>
              <MagicButton
                onClick={handleViewDetails}
                size="md"
              >
                View Details
              </MagicButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
