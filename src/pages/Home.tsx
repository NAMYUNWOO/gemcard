/**
 * Home Page
 *
 * Main page that displays the user's current gem or prompts to summon one.
 * In the single-gem system, users can only have one gem at a time.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { useGemStore } from '../stores/gemStore';
import { copyShareUrl } from '../utils/gemShare';
import { ELEMENT_ICONS, ELEMENT_LABELS, type Element } from '../types/gem';
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
  const { currentGem } = useGemStore();
  const [copied, setCopied] = useState(false);

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

  // If no gem exists, show empty state with summon prompt
  if (!currentGem) {
    return (
      <div className={styles.container}>
        <StarField starCount={50} />

        {/* Share Button */}
        <header className={styles.emptyHeader}>
          <button className={styles.shareBtn} onClick={handleShare}>
            {copied ? 'Copied!' : 'Share'}
          </button>
        </header>

        <main className={styles.emptyState}>
          <h1 className={styles.title}>Arcane Gems</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            "Your destiny awaits crystallization..."
          </p>
          <p className={styles.description}>
            Summon a mystical gem bound to your essence.
            <br />
            Each soul may possess only one gem at a time.
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

          <MagicButton onClick={() => navigate('/summon')} size="lg">
            Summon Your Gem
          </MagicButton>
        </main>
      </div>
    );
  }

  // Show current gem
  const gemParams = {
    shape: currentGem.shape,
    color: currentGem.color,
    turbidity: currentGem.turbidity,
    dispersion: 0.05,
    thickness: 1.5,
    detailLevel: 5,
  };

  const element: Element | undefined = currentGem.magicPower.element;

  return (
    <div className={styles.container}>
      <StarField starCount={40} />

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Your Gem</h1>
        <button className={styles.shareBtn} onClick={handleShare}>
          {copied ? 'Copied!' : 'Share'}
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Gem Display */}
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
          <h2 className={styles.gemName}>{currentGem.name}</h2>

          {/* Divider */}
          <div className={styles.infoDivider} />

          {/* Cut Name */}
          <p className={styles.cutName}>{currentGem.cutName}</p>

          {/* Magic Power Card */}
          <div className={styles.powerCard}>
            <div className={styles.powerHeader}>
              {element && (
                <span className={styles.element}>
                  {ELEMENT_ICONS[element]}
                </span>
              )}
              <h3 className={styles.powerTitle}>{currentGem.magicPower.title}</h3>
            </div>

            <p className={styles.powerDesc}>
              "{currentGem.magicPower.description}"
            </p>

            {element && (
              <span className={styles.elementLabel}>
                Element: {ELEMENT_LABELS[element]}
              </span>
            )}
          </div>

          {/* User Info (if exists) */}
          {currentGem.userInfo?.name && (
            <div className={styles.bondedTo}>
              <span className={styles.bondedLabel}>Bonded to</span>
              <span className={styles.bondedName}>{currentGem.userInfo.name}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <MagicButton
            onClick={() => navigate(`/gem/${currentGem.id}`)}
            variant="secondary"
            size="md"
          >
            View Details
          </MagicButton>
          <MagicButton
            onClick={() => navigate('/summon')}
            size="md"
          >
            Summon New Gem
          </MagicButton>
        </div>
      </main>
    </div>
  );
}
