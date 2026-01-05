/**
 * Home Page
 *
 * Main page that displays the user's current gem or prompts to summon one.
 * In the single-gem system, users can only have one gem at a time.
 */

import { useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { useGemStore } from '../stores/gemStore';
import { ELEMENT_ICONS, ELEMENT_LABELS, type Element } from '../types/gem';
import styles from './Home.module.css';

export function Home() {
  const navigate = useNavigate();
  const { currentGem } = useGemStore();

  // If no gem exists, show empty state with summon prompt
  if (!currentGem) {
    return (
      <div className={styles.container}>
        <StarField starCount={50} />
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
