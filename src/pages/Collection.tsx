/**
 * Collection Page
 *
 * Display user's gem collection with filtering and sorting.
 */

import { useNavigate } from 'react-router-dom';
import { StarField } from '../components/StarField';
import { GemCard } from '../components/GemCard';
import { MagicButton } from '../components/MagicButton';
import { useGemStore, type SortOption, type FilterOption } from '../stores/gemStore';
import { RARITY_LABELS } from '../types/gem';
import styles from './Collection.module.css';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'rarity-high', label: 'Rarity (High)' },
  { value: 'rarity-low', label: 'Rarity (Low)' },
  { value: 'name', label: 'Name' },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'legendary', label: RARITY_LABELS.legendary },
  { value: 'epic', label: RARITY_LABELS.epic },
  { value: 'rare', label: RARITY_LABELS.rare },
  { value: 'uncommon', label: RARITY_LABELS.uncommon },
  { value: 'common', label: RARITY_LABELS.common },
];

export function Collection() {
  const navigate = useNavigate();
  const {
    sortBy,
    filterBy,
    setSortBy,
    setFilterBy,
    getSortedAndFilteredGems,
    getStats,
  } = useGemStore();

  const gems = getSortedAndFilteredGems();
  const stats = getStats();

  return (
    <div className={styles.container}>
      <StarField starCount={50} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>My Collection</h1>
          <p className={styles.gemCount}>{stats.total} Gems</p>
        </div>

        <div className={styles.divider} />
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filter</label>
          <select
            className={styles.filterSelect}
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Sort</label>
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        {gems.length > 0 ? (
          <div className={styles.grid}>
            {gems.map((gem, index: number) => (
              <GemCard key={gem.id} gem={gem} index={index} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            {stats.total === 0 ? (
              <>
                <h2 className={styles.emptyTitle}>No Gems Yet</h2>
                <p className={styles.emptyText}>
                  "Your collection awaits its first treasure..."
                </p>
                <MagicButton onClick={() => navigate('/gacha')} size="lg">
                  Summon Your First Gem
                </MagicButton>
              </>
            ) : (
              <>
                <h2 className={styles.emptyTitle}>No Matches</h2>
                <p className={styles.emptyText}>
                  No gems match the current filter.
                </p>
                <MagicButton
                  onClick={() => setFilterBy('all')}
                  variant="secondary"
                >
                  Clear Filter
                </MagicButton>
              </>
            )}
          </div>
        )}
      </main>

      {/* Summon FAB */}
      {stats.total > 0 && (
        <button className={styles.fab} onClick={() => navigate('/gacha')}>
          <span className={styles.fabIcon}>+</span>
          <span className={styles.fabLabel}>Summon</span>
        </button>
      )}
    </div>
  );
}
