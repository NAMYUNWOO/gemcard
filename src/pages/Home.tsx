/**
 * Home Page
 *
 * Main page that displays the user's gem storage with multi-slot support.
 * Shows all gems in a grid, allows slot purchase, and gem selection.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { SummonModal } from '../components/SummonModal';
import { ParticleSpoiler } from '../components/ParticleSpoiler';
import { useGemStore } from '../stores/gemStore';
import { copyShareUrl } from '../utils/gemShare';
import { ELEMENT_ICONS, getElementLabel, getLocalizedDescription, getLocalizedName, getLocalizedTitle, type Element } from '../types/gem';
import { useLocale, usePremium } from '../hooks';
import { useTranslation } from '../i18n';
import { STORAGE_CONSTANTS } from '../services/storage/types';
import styles from './Home.module.css';

// Preview gem for empty state - enticing users to summon
const PREVIEW_GEM_PARAMS = {
  shape: 'pc01006',  // Classic brilliant cut
  color: '#D4A5FF',  // Light mystical purple
  turbidity: 0.0,    // Fully transparent
  dispersion: 0.01,  // Minimal dispersion
  thickness: 0.5,    // Thin for more transparency
  detailLevel: 5,
};

export function Home() {
  const navigate = useNavigate();
  const { currentGem, gems, maxSlots, activeSlot, setActiveSlot, getAllGems, powerDescRevealed, setPowerDescRevealed } = useGemStore();
  const [copied, setCopied] = useState(false);
  const [showSummonModal, setShowSummonModal] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  // Local state to track target slot for summoning - avoids Zustand/React sync issues
  const [summonTargetSlot, setSummonTargetSlot] = useState<number>(0);
  const gemDetailSectionRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslation();
  const { canBuyPack, buySlotPack, purchasing, refresh: refreshPremium } = usePremium();

  // Get all gems as array with slot info
  const allGems = getAllGems();
  const gemCount = allGems.length;

  // Sync with store changes
  useEffect(() => {
    refreshPremium();
  }, [gems, maxSlots, refreshPremium]);

  const handleShare = async () => {
    try {
      if (currentGem) {
        // Share gem URL
        const success = await copyShareUrl(currentGem);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } else {
        // Share service URL
        await navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard failed
    }
  };

  const handleSlotClick = (slot: number) => {
    const gem = gems[slot];
    if (gem) {
      // Select this gem - update display in place
      setActiveSlot(slot);
    } else {
      // Empty slot - use local state to avoid Zustand/React sync issues
      setSummonTargetSlot(slot);
      setIsReplacing(false);
      setShowSummonModal(true);
    }
  };

  const handleSummonNewGem = () => {
    // Check if current active slot has a gem
    const hasGem = gems[activeSlot] !== undefined;
    setSummonTargetSlot(activeSlot);  // Set target slot before opening modal
    setIsReplacing(hasGem);
    setShowSummonModal(true);
  };

  const handleCloseSummonModal = () => {
    setShowSummonModal(false);
  };

  const handleSummonComplete = () => {
    // Scroll to gemDetailSection after summoning
    setTimeout(() => {
      gemDetailSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);  // Delay for modal close animation
  };

  const handleBuySlots = async () => {
    if (purchasing) return;
    const success = await buySlotPack();
    if (success) {
      // Refresh premium status
      await refreshPremium();
    }
  };

  // If no gems exist, show empty state with summon prompt
  if (gemCount === 0) {
    return (
      <div className={styles.container}>
        <StarField starCount={50} />

        {/* Share Button */}
        <header className={styles.emptyHeader}>
          <button className={styles.shareBtn} onClick={handleShare}>
            {copied ? t.copied : t.share}
          </button>
        </header>

        <main className={styles.emptyState}>
          <h1 className={styles.title}>{t.homeTitle}</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            "{t.homeSubtitle}"
          </p>
          <p className={styles.description}>
            {t.homeDescription}
          </p>

          {/* Preview Gem */}
          <div className={styles.previewGem}>
            <GemScene
              params={PREVIEW_GEM_PARAMS}
              contrast={0.8}
              autoRotate
              dynamicBackground
              magicCircle={20}
            />
          </div>

          <MagicButton onClick={handleSummonNewGem} size="lg">
            {t.summonYourGem}
          </MagicButton>
        </main>

        {/* Summon Modal */}
        <SummonModal
          isOpen={showSummonModal}
          onClose={handleCloseSummonModal}
          targetSlot={summonTargetSlot}
          isReplacing={isReplacing}
          onSummonComplete={handleSummonComplete}
        />
      </div>
    );
  }

  // Show gem storage with current gem display
  const gemParams = currentGem ? {
    shape: currentGem.shape,
    color: currentGem.color,
    turbidity: currentGem.turbidity,
    dispersion: 0.05,
    thickness: 1.5,
    detailLevel: 5,
  } : null;

  const element: Element | undefined = currentGem?.magicPower.element;

  return (
    <div className={styles.container}>
      <StarField starCount={40} />

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>{t.yourGem}</h1>
        <button className={styles.shareBtn} onClick={handleShare}>
          {copied ? t.copied : t.share}
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Gem Storage Grid */}
        <div className={styles.gemStorage}>
          <div className={styles.storageHeader}>
            <h2 className={styles.storageTitle}>{t.myGemStorage}</h2>
            <span className={styles.storageCount}>
              {gemCount} / {maxSlots}
            </span>
          </div>

          <div className={styles.gemGrid}>
            {/* Render slots */}
            {Array.from({ length: maxSlots }).map((_, slot) => {
              const gem = gems[slot];
              const isActive = slot === activeSlot && gem;

              if (gem) {
                return (
                  <button
                    key={slot}
                    className={`${styles.gemSlot} ${isActive ? styles.activeSlot : ''} ${styles[`rarity${gem.rarity.charAt(0).toUpperCase() + gem.rarity.slice(1)}`]}`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    <div className={styles.gemThumbnail}>
                      <GemScene
                        params={{
                          shape: gem.shape,
                          color: gem.color,
                          turbidity: gem.turbidity,
                          dispersion: 0.03,
                          thickness: 1,
                          detailLevel: 3,
                        }}
                        contrast={gem.contrast}
                        autoRotate={false}
                        dynamicBackground={false}
                        magicCircle={gem.magicCircle?.id ?? 17}
                      />
                    </div>
                    <span className={styles.slotGemName}>{getLocalizedName(gem, locale)}</span>
                  </button>
                );
              }

              return (
                <button
                  key={slot}
                  className={styles.emptySlot}
                  onClick={() => handleSlotClick(slot)}
                >
                  <span className={styles.emptyIcon}>◇</span>
                  <span className={styles.emptyText}>{t.emptySlot}</span>
                </button>
              );
            })}

            {/* Buy more slots button */}
            {canBuyPack && maxSlots < STORAGE_CONSTANTS.MAX_SLOTS && (
              <button
                className={styles.buySlotButton}
                onClick={handleBuySlots}
                disabled={purchasing}
              >
                {purchasing ? (
                  <span className={styles.purchasingText}>{t.purchasing}</span>
                ) : (
                  <>
                    <span className={styles.buySlotPlus}>{t.buyMoreSlots}</span>
                    <span className={styles.buySlotPrice}>{t.slotPackPrice}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Current Gem Display + Info */}
        {currentGem && gemParams && (
          <>
            <div ref={gemDetailSectionRef} className={styles.gemDetailSection}>
              <div className={`${styles.gemDisplay} rarity-${currentGem.rarity}`}>
                <GemScene
                  params={gemParams}
                  contrast={currentGem.contrast}
                  autoRotate
                  dynamicBackground
                  magicCircle={currentGem.magicCircle?.id ?? 17}
                />
              </div>

              {/* Gem Info */}
              <div className={styles.info}>
                {/* Rarity */}
                <RarityBadge rarity={currentGem.rarity} size="md" />

                {/* Name */}
                <h2 className={styles.gemName}>{getLocalizedName(currentGem, locale)}</h2>

                {/* Divider */}
                <div className={styles.infoDivider} />

                {/* Magic Power Card */}
                <div className={styles.powerCard}>
                  <div className={styles.powerHeader}>
                    {element && (
                      <span className={styles.element}>
                        {ELEMENT_ICONS[element]}
                      </span>
                    )}
                    <h3 className={styles.powerTitle}>{getLocalizedTitle(currentGem.magicPower, locale)}</h3>
                  </div>

                  <ParticleSpoiler
                    hidden={!powerDescRevealed}
                    onClick={() => setPowerDescRevealed(true)}
                    particleColor="#aaaaaa"
                  >
                    <p className={styles.powerDesc}>
                      "{getLocalizedDescription(currentGem.magicPower, locale)}"
                    </p>
                  </ParticleSpoiler>

                  {element && (
                    <span className={styles.elementLabel}>
                      {t.element}: {getElementLabel(element, locale)}
                    </span>
                  )}
                </div>

                {/* User Info (if exists) */}
                {currentGem.userInfo?.name && (
                  <div className={styles.bondedTo}>
                    <span className={styles.bondedLabel}>{t.bondedTo}</span>
                    <span className={styles.bondedName}>{currentGem.userInfo.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <MagicButton
                onClick={() => navigate(`/gem/${currentGem.id}`)}
                variant="secondary"
                size="md"
              >
                {t.viewDetails}
              </MagicButton>
              <MagicButton
                onClick={handleSummonNewGem}
                size="md"
              >
                {t.summonNewGem}
              </MagicButton>
            </div>
          </>
        )}

        {/* If no current gem selected but have gems, prompt to select */}
        {!currentGem && gemCount > 0 && (
          <div className={styles.selectPrompt}>
            <p>{t.selectSlot}</p>
          </div>
        )}
      </main>

      {/* Summon Modal */}
      <SummonModal
        isOpen={showSummonModal}
        onClose={handleCloseSummonModal}
        targetSlot={summonTargetSlot}
        isReplacing={isReplacing}
        onSummonComplete={handleSummonComplete}
      />
    </div>
  );
}
