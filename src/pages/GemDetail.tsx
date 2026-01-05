/**
 * GemDetail Page
 *
 * Detailed view of a magic gem with its properties and powers.
 * In single-gem system, this shows the user's only gem.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { useGemStore } from '../stores/gemStore';
import {
  ELEMENT_ICONS,
  ELEMENT_LABELS,
  GENDER_LABELS,
  type Element,
} from '../types/gem';
import styles from './GemDetail.module.css';

export function GemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGem } = useGemStore();

  // In single-gem system, we show the current gem
  // The id param is kept for URL compatibility
  const gem = currentGem && currentGem.id === id ? currentGem : null;

  if (!gem) {
    return (
      <div className={styles.container}>
        <StarField starCount={30} />
        <div className={styles.notFound}>
          <h2>Gem Not Found</h2>
          <p>This gem has vanished into the void...</p>
          <MagicButton onClick={() => navigate('/')}>
            Return Home
          </MagicButton>
        </div>
      </div>
    );
  }

  const gemParams = {
    shape: gem.shape,
    color: gem.color,
    turbidity: gem.turbidity,
    dispersion: 0.05,
    thickness: 1.5,
    detailLevel: 5,
  };

  const obtainedDate = new Date(gem.obtainedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const element: Element | undefined = gem.magicPower.element;

  // Format birth time if available
  const formatBirthTime = () => {
    const bd = gem.userInfo?.birthdate;
    if (!bd) return null;

    const parts: string[] = [];
    if (bd.hour !== undefined) parts.push(String(bd.hour).padStart(2, '0'));
    if (bd.minute !== undefined) parts.push(String(bd.minute).padStart(2, '0'));
    if (bd.second !== undefined) parts.push(String(bd.second).padStart(2, '0'));

    return parts.length > 0 ? parts.join(':') : null;
  };

  const birthTime = formatBirthTime();

  return (
    <div className={styles.container}>
      <StarField starCount={40} />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <span className={styles.backIcon}>{'<'}</span>
          <span>Home</span>
        </button>

        <button className={styles.shareBtn} onClick={() => {/* TODO: Share */}}>
          Share
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Gem Display */}
        <div className={`${styles.gemDisplay} rarity-${gem.rarity}`}>
          <GemScene
            params={gemParams}
            contrast={gem.contrast}
            autoRotate
            dynamicBackground
            magicCircle={gem.magicCircle?.id ?? 17}
          />
        </div>

        {/* Gem Info */}
        <div className={styles.info}>
          {/* Rarity */}
          <RarityBadge rarity={gem.rarity} size="md" />

          {/* Name */}
          <h1 className={styles.gemName}>{gem.name}</h1>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Cut Name */}
          <p className={styles.cutName}>{gem.cutName}</p>

          {/* Magic Power Card */}
          <div className={styles.powerCard}>
            <div className={styles.powerHeader}>
              {element && (
                <span className={styles.element}>
                  {ELEMENT_ICONS[element]}
                </span>
              )}
              <h2 className={styles.powerTitle}>{gem.magicPower.title}</h2>
            </div>

            <p className={styles.powerDesc}>
              "{gem.magicPower.description}"
            </p>

            {element && (
              <span className={styles.elementLabel}>
                Element: {ELEMENT_LABELS[element]}
              </span>
            )}
          </div>

          {/* Magic Circle Info */}
          {gem.magicCircle && (
            <div className={styles.circleInfo}>
              <span className={styles.circleLabel}>Sealed by</span>
              <span className={styles.circleName}>{gem.magicCircle.name}</span>
              <span className={styles.circleMeaning}>{gem.magicCircle.meaning}</span>
            </div>
          )}

          {/* User Info Section */}
          {gem.userInfo && (gem.userInfo.name || gem.userInfo.gender || gem.userInfo.birthdate) && (
            <div className={styles.userInfo}>
              <span className={styles.userInfoLabel}>Bonded To</span>

              {gem.userInfo.name && (
                <span className={styles.userName}>{gem.userInfo.name}</span>
              )}

              <div className={styles.userDetails}>
                {gem.userInfo.gender && (
                  <span className={styles.userDetail}>
                    {GENDER_LABELS[gem.userInfo.gender]}
                  </span>
                )}

                {gem.userInfo.birthdate?.date && (
                  <span className={styles.userDetail}>
                    Born: {gem.userInfo.birthdate.date}
                    {birthTime && ` at ${birthTime}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Obtained</span>
              <span className={styles.metaValue}>{obtainedDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Origin</span>
              <span className={styles.metaValue}>
                {gem.origin === 'gacha' && 'Summoned'}
                {gem.origin === 'exchange' && 'Exchanged'}
                {gem.origin === 'gift' && 'Gifted'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <MagicButton
            size="md"
            onClick={() => navigate('/summon')}
          >
            Summon New Gem
          </MagicButton>
        </div>
      </main>
    </div>
  );
}
