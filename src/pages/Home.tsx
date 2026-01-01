import { Link } from 'react-router-dom';
import { useCardStore } from '../stores/cardStore';
import { GemScene } from '../components/GemScene';
import styles from './Home.module.css';

export function Home() {
  const { cards } = useCardStore();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>GemCard</h1>
        <p className={styles.subtitle}>소중한 마음을 보석에 담아</p>
      </header>

      <Link to="/create" className={styles.createButton}>
        새 카드 만들기
      </Link>

      {cards.length > 0 ? (
        <section className={styles.cardsSection}>
          <h2 className={styles.sectionTitle}>내 카드</h2>
          <div className={styles.cardGrid}>
            {cards.map((card) => (
              <Link
                key={card.id}
                to={`/card/${card.id}`}
                className={styles.cardItem}
              >
                <div className={styles.cardPreview}>
                  <GemScene
                    params={card.gem}
                    cardMessage={card.message.content}
                    senderName={card.message.senderName}
                    maxChars={20}
                    autoRotate
                  />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardShape}>💎</span>
                  {card.message.senderName && (
                    <span className={styles.sender}>From: {card.message.senderName}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>아직 카드가 없어요</p>
          <p className={styles.emptyHint}>첫 번째 보석 카드를 만들어보세요!</p>
        </div>
      )}
    </div>
  );
}
