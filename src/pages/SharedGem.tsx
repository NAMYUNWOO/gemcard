/**
 * SharedGem Page
 *
 * Displays a gem from a shared URL.
 * Decodes the compressed data and renders the gem.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { decodeGemFromUrl } from '../utils/gemShare';
import {
  ELEMENT_ICONS,
  ELEMENT_LABELS,
  GENDER_LABELS,
  type Element,
} from '../types/gem';
import styles from './SharedGem.module.css';

export function SharedGem() {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();

  // Decode gem from URL
  const gem = useMemo(() => {
    if (!data) return null;
    return decodeGemFromUrl(data);
  }, [data]);

  // Error state
  if (!gem) {
    return (
      <div className={styles.container}>
        <StarField starCount={30} />
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Invalid Link</h2>
          <p className={styles.errorText}>
            This gem link is invalid or corrupted.
          </p>
          <MagicButton onClick={() => navigate('/')}>
            Go Home
          </MagicButton>
        </div>
      </div>
    );
  }

  const gemParams = {
    shape: gem.shape!,
    color: gem.color!,
    turbidity: gem.turbidity!,
    dispersion: 0.05,
    thickness: 1.5,
    detailLevel: 5,
  };

  const element: Element | undefined = gem.magicPower?.element;

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
        <span className={styles.sharedLabel}>
          {gem.userInfo?.name ? `${gem.userInfo.name}'s Gem` : 'Shared Gem'}
        </span>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Gem Display */}
        <div className={`${styles.gemDisplay} rarity-${gem.rarity}`}>
          <GemScene
            params={gemParams}
            contrast={gem.contrast ?? 0.8}
            autoRotate
            dynamicBackground
            magicCircle={gem.magicCircle?.id ?? 17}
          />
        </div>

        {/* Gem Info */}
        <div className={styles.info}>
          {/* Rarity */}
          {gem.rarity && <RarityBadge rarity={gem.rarity} size="md" />}

          {/* Name */}
          <h1 className={styles.gemName}>{gem.name}</h1>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Magic Power Card */}
          {gem.magicPower && (
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
          )}

          {/* Magic Circle Info */}
          {gem.magicCircle && (
            <div className={styles.circleInfo}>
              <span className={styles.circleLabel}>Sealed by</span>
              <span className={styles.circleName}>{gem.magicCircle.name}</span>
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
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <MagicButton onClick={() => navigate('/')} size="md">
            Summon Your Own Gem
          </MagicButton>
        </div>
      </main>
    </div>
  );
}
