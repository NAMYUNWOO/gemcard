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
  getElementLabel,
  getGenderLabel,
  getLocalizedDescription,
  getLocalizedName,
  getLocalizedTitle,
  getMagicCircleName,
  type Element,
} from '../types/gem';
import { useBackEvent, useLocale } from '../hooks';
import { useTranslation } from '../i18n';
import styles from './SharedGem.module.css';

interface SharedGemProps {
  gemData?: string; // From query param (Toss deep link)
}

export function SharedGem({ gemData }: SharedGemProps) {
  const { data: routeData } = useParams<{ data: string }>();
  const navigate = useNavigate();
  const locale = useLocale();
  const t = useTranslation();

  // Use gemData prop (from query param) or route param
  const data = gemData || routeData;

  // Handle back button in apps-in-toss WebView
  useBackEvent();

  // Decode gem from URL
  const gem = useMemo(() => {
    if (!data) return null;
    try {
      return decodeGemFromUrl(data);
    } catch {
      return null;
    }
  }, [data]);

  // Error state
  if (!gem) {
    return (
      <div className={styles.container}>
        <StarField starCount={30} />
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>{t.invalidLink}</h2>
          <p className={styles.errorText}>
            {t.invalidLinkMessage}
          </p>
          <MagicButton onClick={() => navigate('/')}>
            {t.goHome}
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
          {gem.userInfo?.name ? `${gem.userInfo.name}${t.someoneGem}` : t.sharedGem}
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
          <h1 className={styles.gemName}>{gem.name ? getLocalizedName(gem as { name: string }, locale) : ''}</h1>

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
                <h2 className={styles.powerTitle}>{gem.magicPower.title ? getLocalizedTitle(gem.magicPower, locale) : ''}</h2>
              </div>

              <p className={styles.powerDesc}>
                "{getLocalizedDescription(gem.magicPower, locale)}"
              </p>

              {element && (
                <span className={styles.elementLabel}>
                  {t.element}: {getElementLabel(element, locale)}
                </span>
              )}
            </div>
          )}

          {/* Magic Circle Info */}
          {gem.magicCircle && (
            <div className={styles.circleInfo}>
              <span className={styles.circleLabel}>{t.sealedBy}</span>
              <span className={styles.circleName}>{getMagicCircleName(gem.magicCircle, locale)}</span>
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
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <MagicButton
            onClick={() => {
              // query param 제거하고 홈으로 이동
              window.location.href = window.location.pathname;
            }}
            size="md"
          >
            {t.summonYourOwn}
          </MagicButton>
        </div>
      </main>
    </div>
  );
}
