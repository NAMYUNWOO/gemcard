import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GemScene } from '../components/GemScene';
import { useCardStore } from '../stores/cardStore';
import { shareCard } from '../utils/compression';
import styles from './Card.module.css';

const SHAPE_LABELS: Record<string, string> = {
  brilliant: 'Round Brilliant',
  emerald: 'Emerald Cut',
  princess: 'Princess Cut',
  pear: 'Pear Cut',
  oval: 'Oval Cut',
  sphere: 'Sphere',
};

export function Card() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCard, deleteCard } = useCardStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);

  const card = id ? getCard(id) : undefined;

  useEffect(() => {
    if (!card) {
      navigate('/');
    }
  }, [card, navigate]);

  if (!card) {
    return (
      <div className={styles.loading}>
        <p>카드를 불러오는 중...</p>
      </div>
    );
  }

  const handleShare = async () => {
    setIsSharing(true);
    const success = await shareCard(card);
    setIsSharing(false);

    if (success) {
      alert('링크가 복사되었습니다!');
    } else {
      alert('공유에 실패했습니다.');
    }
  };

  const handleDelete = () => {
    if (confirm('이 카드를 삭제하시겠습니까?')) {
      deleteCard(card.id);
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.headerButton} onClick={() => navigate('/')}>
          ← 뒤로
        </button>
        <button className={styles.headerButton} onClick={handleDelete}>
          <span className={styles.deleteText}>삭제</span>
        </button>
      </header>

      <div className={styles.cardContainer}>
        <div
          className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front - Gem with animated message in background */}
          <div className={styles.cardFace}>
            {/* Gem with floating message background */}
            <div className={styles.gemContainer}>
              <GemScene
                params={card.gem}
                cardMessage={card.message.content}
                senderName={card.message.senderName}
                maxChars={40}
                autoRotate
              />
            </div>
            {/* Card Info Overlay */}
            <div className={styles.cardOverlay}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>GEM CARD</span>
                <span className={styles.badge}>{SHAPE_LABELS[card.gem.shape] || card.gem.shape}</span>
              </div>
              <div className={styles.cardFooter}>
                {card.message.senderName && (
                  <span className={styles.senderText}>From: {card.message.senderName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Back - Full Message */}
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
        <button
          className={styles.shareButton}
          onClick={handleShare}
          disabled={isSharing}
        >
          {isSharing ? '공유 중...' : '공유하기'}
        </button>
      </div>
    </div>
  );
}
