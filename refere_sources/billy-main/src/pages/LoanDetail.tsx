import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Loan } from '../types/loan';
import { getLoan, markAsPaidBack, deleteLoan } from '../lib/db';
import { shareLoanPDF } from '../lib/pdfGenerator';

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaidBackDialog, setShowPaidBackDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadLoan(id);
    }
  }, [id]);

  const loadLoan = async (loanId: string) => {
    try {
      const data = await getLoan(loanId);
      setLoan(data);
    } catch (error) {
      console.error('Failed to load loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaidBack = async () => {
    if (!loan) return;

    try {
      await markAsPaidBack(loan.id);
      setLoan({ ...loan, isPaidBack: true, paidBackDate: new Date().toISOString() });
      setShowPaidBackDialog(false);
    } catch (error) {
      console.error('Failed to mark as paid back:', error);
      alert('처리에 실패했어요');
    }
  };

  const handleDelete = async () => {
    if (!loan) return;

    try {
      await deleteLoan(loan.id);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete loan:', error);
      alert('삭제에 실패했어요');
    }
  };

  const handleSendReminder = () => {
    if (!loan) return;

    const message = generateReminderMessage(loan);

    // Web Share API 또는 SMS 링크 사용
    if (navigator.share) {
      navigator.share({
        title: '빌리 - 독촉 메시지',
        text: message,
      }).catch(() => {
        // 공유 취소시 무시
      });
    } else {
      // SMS 링크로 fallback
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    }
  };

  const generateReminderMessage = (loan: Loan) => {
    const amount = new Intl.NumberFormat('ko-KR').format(loan.amount);
    const loanDate = new Date(loan.loanDate);
    const dateStr = `${loanDate.getMonth() + 1}월 ${loanDate.getDate()}일`;

    const messages = [
      `안녕~ ${dateStr}에 빌려간 ${amount}원 혹시 기억나? 시간 될 때 갚아줘~`,
      `${loan.borrowerName}아, ${dateStr}에 빌려간 ${amount}원 있잖아. 언제 갚을 수 있어?`,
      `혹시 ${dateStr}에 빌려간 ${amount}원 기억해? 나도 좀 필요해서 그래~`,
      `${amount}원 빌려간 거 기억하지? 시간 될 때 보내줘!`,
    ];

    // 랜덤 메시지 선택
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSharePDF = async () => {
    if (!loan) return;

    try {
      await shareLoanPDF(loan);
    } catch (error) {
      if (error instanceof Error && error.message.includes('공유')) {
        alert(error.message);
      } else {
        console.error('PDF 생성 실패:', error);
        alert('PDF 생성에 실패했어요');
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>상세</h1>
        </header>
        <div className="content">
          <div className="skeleton" style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="page">
        <header className="app-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>상세</h1>
        </header>
        <div className="content">
          <div className="empty-state">
            <p>기록을 찾을 수 없어요</p>
          </div>
        </div>
      </div>
    );
  }

  const daysSince = getDaysSince(loan.loanDate);

  const buttonStyle = {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontWeight: 600 as const,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer' as const,
  };

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>상세</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="text-button" onClick={handleSharePDF}>
            공유
          </button>
          <button className="text-button danger" onClick={() => setShowDeleteDialog(true)}>
            삭제
          </button>
        </div>
      </header>

      <div className="content detail-content">
        {/* 헤더 정보 */}
        <div className="detail-header">
          <h1 className="detail-name">{loan.borrowerName}</h1>
          <p className="detail-amount">{formatAmount(loan.amount)}원</p>
          {loan.interestRate > 0 && (
            <p className="detail-interest">연 이자 {loan.interestRate}%</p>
          )}
          {loan.isPaidBack ? (
            <span className="status-badge paid">상환 완료</span>
          ) : (
            <span className="status-badge pending">{daysSince}일째 미상환</span>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="detail-info">
          <div className="info-row">
            <span className="info-label">빌려준 날</span>
            <span className="info-value">{formatDate(loan.loanDate)}</span>
          </div>

          {loan.dueDate && (
            <div className="info-row">
              <span className="info-label">갚기로 한 날</span>
              <span className="info-value">{formatDate(loan.dueDate)}</span>
            </div>
          )}

          {loan.paidBackDate && (
            <div className="info-row">
              <span className="info-label">상환 완료일</span>
              <span className="info-value">{formatDate(loan.paidBackDate)}</span>
            </div>
          )}

          {loan.memo && (
            <div className="info-row vertical">
              <span className="info-label">메모</span>
              <span className="info-value memo">{loan.memo}</span>
            </div>
          )}
        </div>

        {/* 증거사진 */}
        {loan.photos.length > 0 && (
          <div className="detail-photos">
            <h3 className="section-title">증거사진</h3>
            <div className="photo-grid view-mode">
              {loan.photos.map((photo, index) => (
                <div
                  key={index}
                  className="photo-item"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo} alt={`증거사진 ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      {!loan.isPaidBack && (
        <div className="bottom-buttons">
          <button
            style={{
              ...buttonStyle,
              background: '#F4F5F7',
              color: '#333D4B',
            }}
            onClick={handleSendReminder}
          >
            독촉하기
          </button>
          <button
            style={{
              ...buttonStyle,
              background: '#3182F6',
              color: 'white',
            }}
            onClick={() => setShowPaidBackDialog(true)}
          >
            받았어요
          </button>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>기록 삭제</h2>
            <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>
              이 기록을 삭제할까요? 삭제하면 되돌릴 수 없어요.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{
                  flex: 1,
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#F4F5F7',
                  color: '#333D4B',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
                onClick={() => setShowDeleteDialog(false)}
              >
                취소
              </button>
              <button
                style={{
                  flex: 1,
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#F04452',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상환 확인 다이얼로그 */}
      {showPaidBackDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowPaidBackDialog(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>상환 완료</h2>
            <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>
              {loan.borrowerName}님에게 {formatAmount(loan.amount)}원을 받으셨나요?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{
                  flex: 1,
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#F4F5F7',
                  color: '#333D4B',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
                onClick={() => setShowPaidBackDialog(false)}
              >
                아직이요
              </button>
              <button
                style={{
                  flex: 1,
                  padding: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#3182F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
                onClick={handlePaidBack}
              >
                받았어요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사진 확대 보기 */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="증거사진" />
        </div>
      )}
    </div>
  );
}
