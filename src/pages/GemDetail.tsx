/**
 * GemDetail Page
 *
 * Detailed view of a magic gem with its properties and powers.
 * In single-gem system, this shows the user's only gem.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { MagicButton } from '../components/MagicButton';
import { ParticleSpoiler } from '../components/ParticleSpoiler';
import { useGemStore } from '../stores/gemStore';
import { copyShareUrl } from '../utils/gemShare';
import {
  ELEMENT_ICONS,
  getElementLabel,
  getGenderLabel,
  getLocalizedDescription,
  getLocalizedName,
  getLocalizedTitle,
  getMagicCircleName,
  getMagicCircleMeaning,
  type Element,
} from '../types/gem';
import { useLocale, useRevealAction } from '../hooks';
import { useTranslation } from '../i18n';
import styles from './GemDetail.module.css';

export function GemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGem, powerDescRevealed, setPowerDescRevealed } = useGemStore();
  const [copied, setCopied] = useState(false);
  const locale = useLocale();
  const t = useTranslation();

  // Spoiler reveal action hook
  const { executeAction: handleRevealClick } = useRevealAction({
    gem: currentGem,
    onSuccess: () => setPowerDescRevealed(true),
  });

  const handleShare = async () => {
    if (!currentGem) return;

    const success = await copyShareUrl(currentGem);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // In single-gem system, we show the current gem
  // The id param is kept for URL compatibility
  const gem = currentGem && currentGem.id === id ? currentGem : null;

  if (!gem) {
    return (
      <div className={styles.container}>
        <StarField starCount={30} />
        <div className={styles.notFound}>
          <h2>{t.gemNotFound}</h2>
          <p>{t.gemNotFoundMessage}</p>
          <MagicButton onClick={() => navigate('/')}>
            {t.returnHome}
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

  const obtainedDate = new Date(gem.obtainedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale, {
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
          <span>{t.home}</span>
        </button>

        <button className={styles.shareBtn} onClick={handleShare}>
          {copied ? t.copied : t.share}
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
          <h1 className={styles.gemName}>{getLocalizedName(gem, locale)}</h1>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Magic Power Card */}
          <div className={styles.powerCard}>
            <div className={styles.powerHeader}>
              {element && (
                <span className={styles.element}>
                  {ELEMENT_ICONS[element]}
                </span>
              )}
              <h2 className={styles.powerTitle}>{getLocalizedTitle(gem.magicPower, locale)}</h2>
            </div>

            <ParticleSpoiler
              hidden={!powerDescRevealed}
              onClick={handleRevealClick}
              particleColor="#aaaaaa"
            >
              <p className={styles.powerDesc}>
                "{getLocalizedDescription(gem.magicPower, locale)}"
              </p>
            </ParticleSpoiler>

            {element && (
              <span className={styles.elementLabel}>
                {t.element}: {getElementLabel(element, locale)}
              </span>
            )}
          </div>

          {/* Magic Circle Info */}
          {gem.magicCircle && (
            <div className={styles.circleInfo}>
              <span className={styles.circleLabel}>{t.sealedBy}</span>
              <span className={styles.circleName}>{getMagicCircleName(gem.magicCircle, locale)}</span>
              <span className={styles.circleMeaning}>{getMagicCircleMeaning(gem.magicCircle, locale)}</span>
            </div>
          )}

          {/* User Info Section */}
          {gem.userInfo && (gem.userInfo.name || gem.userInfo.gender || gem.userInfo.birthdate) && (
            <div className={styles.userInfo}>
              <span className={styles.userInfoLabel}>{t.bondedTo}</span>

              {gem.userInfo.name && (
                <span className={styles.userName}>{gem.userInfo.name}</span>
              )}

              <div className={styles.userDetails}>
                {gem.userInfo.gender && (
                  <span className={styles.userDetail}>
                    {getGenderLabel(gem.userInfo.gender, locale)}
                  </span>
                )}

                {gem.userInfo.birthdate?.date && (
                  <span className={styles.userDetail}>
                    {t.born}: {gem.userInfo.birthdate.date}
                    {birthTime && ` ${birthTime}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{t.obtained}</span>
              <span className={styles.metaValue}>{obtainedDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{t.origin}</span>
              <span className={styles.metaValue}>
                {gem.origin === 'gacha' && t.originGacha}
                {gem.origin === 'exchange' && t.originExchange}
                {gem.origin === 'gift' && t.originGift}
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
            {t.summonNewGem}
          </MagicButton>
        </div>
      </main>
    </div>
  );
}
