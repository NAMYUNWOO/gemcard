/**
 * Gacha Page
 *
 * Mystical gem summoning experience with animated magic circle.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { SummonCircle } from '../components/SummonCircle';
import { MagicButton } from '../components/MagicButton';
import { GemScene } from '../components/GemScene';
import { RarityBadge } from '../components/RarityBadge';
import { generateMagicGem } from '../utils/gemGenerator';
import { useGemStore } from '../stores/gemStore';
import type { MagicGem } from '../types/gem';
import { ELEMENT_ICONS } from '../types/gem';
import styles from './Gacha.module.css';

type GachaState = 'idle' | 'summoning' | 'revealed';

export function Gacha() {
  const navigate = useNavigate();
  const { addGem, gems } = useGemStore();

  const [state, setState] = useState<GachaState>('idle');
  const [summonedGem, setSummonedGem] = useState<MagicGem | null>(null);

  const handleSummon = useCallback(async () => {
    if (state !== 'idle') return;

    setState('summoning');

    // Generate gem
    const gem = await generateMagicGem('gacha');

    // Delay for animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSummonedGem(gem);
    setState('revealed');
  }, [state]);

  const handleCollect = useCallback(() => {
    if (!summonedGem) return;

    addGem(summonedGem);
    setSummonedGem(null);
    setState('idle');
  }, [summonedGem, addGem]);

  const handleViewDetails = useCallback(() => {
    if (!summonedGem) return;

    addGem(summonedGem);
    navigate(`/gem/${summonedGem.id}`);
  }, [summonedGem, addGem, navigate]);

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
          <span>Collection</span>
        </button>
        <span className={styles.gemCount}>{gems.length} Gems</span>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {state === 'idle' && (
          <>
            {/* Summoning Circle */}
            <div className={styles.circleWrapper}>
              <SummonCircle isActive size={280} />
            </div>

            {/* Flavor Text */}
            <p className={styles.flavorText}>
              "The stars align, awaiting your command..."
            </p>

            {/* Summon Button */}
            <MagicButton
              onClick={handleSummon}
              size="lg"
              className={styles.summonBtn}
            >
              Summon a Gem
            </MagicButton>
          </>
        )}

        {state === 'summoning' && (
          <>
            {/* Summoning Animation */}
            <div className={styles.circleWrapper}>
              <SummonCircle isActive isSummoning size={280} />
            </div>

            <p className={styles.summoningText}>
              "Ancient forces stir..."
            </p>
          </>
        )}

        {state === 'revealed' && summonedGem && gemParams && (
          <div className={styles.revealContainer}>
            {/* Gem Display */}
            <div className={styles.gemDisplay}>
              <GemScene
                params={gemParams}
                contrast={summonedGem.contrast}
                autoRotate
                dynamicBackground
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
                onClick={handleCollect}
                variant="secondary"
                size="md"
              >
                Collect & Summon Again
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
