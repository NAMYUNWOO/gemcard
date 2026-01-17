import type { Loan } from '../types/loan';

interface LoanCardProps {
  loan: Loan;
  onClick: () => void;
}

export default function LoanCard({ loan, onClick }: LoanCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '오늘';
    if (diff === 1) return '어제';
    return `${diff}일 전`;
  };

  return (
    <div
      className={`loan-card ${loan.isPaidBack ? 'paid-back' : ''}`}
      onClick={onClick}
    >
      <div className="loan-card-header">
        <span className="borrower-name">{loan.borrowerName}</span>
        {loan.isPaidBack ? (
          <span className="badge-text">완료</span>
        ) : (
          <span className="loan-date">{getDaysAgo(loan.loanDate)}</span>
        )}
      </div>

      <div className="loan-card-body">
        <span className="loan-amount">{formatAmount(loan.amount)}원</span>
        {loan.interestRate > 0 && (
          <span className="interest-rate">이자 {loan.interestRate}%</span>
        )}
      </div>

      {loan.dueDate && !loan.isPaidBack && (
        <div className="loan-card-footer">
          <span className="due-date">{formatDate(loan.dueDate)}까지</span>
        </div>
      )}

      {loan.photos.length > 0 && (
        <div className="photo-indicator">
          <span>📷 {loan.photos.length}</span>
        </div>
      )}
    </div>
  );
}
