/**
 * GemDetail Page
 *
 * Detailed view of a magic gem with its properties and powers.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { useGemStore } from '../stores/gemStore';
import { ELEMENT_ICONS, ELEMENT_LABELS, type Element } from '../types/gem';
import styles from './GemDetail.module.css';

export function GemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGem } = useGemStore();

  const gem = id ? getGem(id) : undefined;

  if (!gem) {
    return (
      <div className={styles.container}>
        <StarField starCount={30} />
        <div className={styles.notFound}>
          <h2>Gem Not Found</h2>
          <p>This gem has vanished into the void...</p>
          <MagicButton onClick={() => navigate('/')}>
            Return to Collection
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

  return (
    <div className={styles.container}>
      <StarField starCount={40} />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <span className={styles.backIcon}>{'<'}</span>
          <span>Back</span>
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
            variant="secondary"
            size="md"
            onClick={() => {/* TODO: Exchange */}}
          >
            Propose Exchange
          </MagicButton>
          <MagicButton
            size="md"
            onClick={() => navigate('/gacha')}
          >
            Summon Another
          </MagicButton>
        </div>
      </main>
    </div>
  );
}
