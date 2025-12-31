import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GemScene } from '../components/GemScene';
import { useCardStore } from '../stores/cardStore';
import { deserializeCard } from '../utils/compression';
import type { GemCard } from '../types/card';
import styles from './Receive.module.css';

const SHAPE_LABELS: Record<string, string> = {
  brilliant: 'Round Brilliant',
  emerald: 'Emerald Cut',
  princess: 'Princess Cut',
  pear: 'Pear Cut',
  oval: 'Oval Cut',
};

export function Receive() {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();
  const { addCard } = useCardStore();
  const [card, setCard] = useState<GemCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);

  useEffect(() => {
    if (data) {
      const decodedCard = deserializeCard(decodeURIComponent(data));
      if (decodedCard) {
        setCard(decodedCard);
      } else {
        setError('카드를 불러올 수 없습니다. 링크가 손상되었을 수 있습니다.');
      }
    }
  }, [data]);

  const handleSave = () => {
    if (!card) return;
    addCard(card);
    setIsSaved(true);
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <span className={styles.errorEmoji}>😢</span>
          <h2 className={styles.errorTitle}>오류가 발생했습니다</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.button} onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className={styles.loading}>
        <p>카드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.closeButton} onClick={() => navigate('/')}>
          ✕
        </button>
      </header>

      <div className={styles.messageHeader}>
        <h1 className={styles.receivedTitle}>
          {card.message.senderName
            ? `${card.message.senderName}님이 보낸 카드`
            : '새로운 GemCard가 도착했습니다!'}
        </h1>
      </div>

      <div className={styles.cardContainer}>
        <div
          className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front - Gem */}
          <div className={styles.cardFace}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>GEM CARD</span>
              <span className={styles.badge}>{SHAPE_LABELS[card.gem.shape]}</span>
            </div>
            <div className={styles.gemContainer}>
              <GemScene
                params={card.gem}
                cardMessage={card.message.content}
                senderName={card.message.senderName}
                maxChars={40}
                autoRotate
              />
            </div>
            <div className={styles.cardFooter}>
              {card.message.senderName && (
                <span className={styles.senderText}>From: {card.message.senderName}</span>
              )}
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Clarity</span>
                  <span className={styles.statValue}>{Math.round((1 - card.gem.turbidity) * 100)}%</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Detail</span>
                  <span className={styles.statValue}>{card.gem.detailLevel + 3}/9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back - Message */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <div className={styles.messageContainer}>
              <p className={styles.message}>{card.message.content}</p>
              {card.message.senderName && (
                <p className={styles.messageSender}>- {card.message.senderName}</p>
              )}
            </div>
          </div>
        </div>

        <p className={styles.hint}>탭하여 뒤집기</p>

        <button
          className={`${styles.fullMessageBtn} ${isFlipped ? styles.visible : ''}`}
          onClick={() => setShowFullMessage(true)}
        >
          전체 글 보기
        </button>
      </div>

      {/* Full Message Overlay Modal */}
      {showFullMessage && (
        <div className={styles.overlay} onClick={() => setShowFullMessage(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalMessage}>{card.message.content}</p>
            {card.message.senderName && (
              <p className={styles.modalSender}>- {card.message.senderName}</p>
            )}
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowFullMessage(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        {!isSaved ? (
          <button className={styles.saveButton} onClick={handleSave}>
            내 카드에 저장하기
          </button>
        ) : (
          <div className={styles.savedContainer}>
            <p className={styles.savedText}>✓ 저장되었습니다!</p>
            <button className={styles.homeButton} onClick={() => navigate('/')}>
              내 카드 보러가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
