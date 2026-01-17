import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button } from '@toss/tds-mobile';
import type { Loan } from '../types/loan';
import { getAllLoans, getTotalLentAmount } from '../lib/db';
import LoanCard from '../components/LoanCard';

export default function Home() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loanList, total] = await Promise.all([
        getAllLoans(),
        getTotalLentAmount(),
      ]);
      setLoans(loanList);
      setTotalAmount(total);
    } catch (err) {
      console.error('Failed to load loans:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
  }

  const activeLoans = loans.filter((loan) => !loan.isPaidBack);
  const paidBackLoans = loans.filter((loan) => loan.isPaidBack);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="page">
      <header className="app-header">
        <h1>빌리</h1>
      </header>

      <div className="content">
        {/* 총 빌려준 금액 */}
        <div className="summary-card">
          <p className="summary-label">아직 못 받은 돈</p>
          {loading ? (
            <div className="skeleton" style={{ width: 150, height: 36 }} />
          ) : (
            <p className="summary-amount">{formatAmount(totalAmount)}원</p>
          )}
        </div>

        {/* 대출 목록 */}
        <div className="loan-section">
          {loading ? (
            <>
              <div className="skeleton" style={{ width: '100%', height: 80, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '100%', height: 80, marginBottom: 12 }} />
            </>
          ) : activeLoans.length === 0 && paidBackLoans.length === 0 ? (
            <div className="empty-state">
              <p>아직 기록이 없어요</p>
              <p className="empty-sub">돈을 빌려줬다면 기록해보세요</p>
              <button
                onClick={() => navigate('/add')}
                style={{
                  marginTop: 24,
                  padding: '14px 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#3182F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                + 기록하기
              </button>
            </div>
          ) : (
            <>
              {activeLoans.length > 0 && (
                <>
                  <h3 className="section-title">받아야 할 돈</h3>
                  {activeLoans.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      onClick={() => navigate(`/loan/${loan.id}`)}
                    />
                  ))}
                </>
              )}

              {paidBackLoans.length > 0 && (
                <>
                  <h3 className="section-title" style={{ marginTop: 24 }}>
                    받은 돈
                  </h3>
                  {paidBackLoans.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      onClick={() => navigate(`/loan/${loan.id}`)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 추가 버튼 - 기록이 있을 때만 표시 */}
      {loans.length > 0 && (
        <div className="fab-container">
          <button
            style={{
              width: '100%',
              padding: 16,
              fontSize: 16,
              fontWeight: 600,
              background: '#3182F6',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/add')}
          >
            + 기록하기
          </button>
        </div>
      )}
    </div>
  );
}
