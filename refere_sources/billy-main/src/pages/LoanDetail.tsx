import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ConfirmDialog } from '@toss/tds-mobile';
import type { Loan } from '../types/loan';
import { getLoan, markAsPaidBack, deleteLoan } from '../lib/db';
import { generateLoanPDF } from '../lib/pdfGenerator';
import { saveBase64Data, share } from '@apps-in-toss/web-framework';
import { useBackEvent } from '../hooks/useBackEvent';

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaidBackDialog, setShowPaidBackDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showShareSuccessDialog, setShowShareSuccessDialog] = useState(false);

  // 공통 내비게이션 백버튼 이벤트 처리
  useBackEvent();

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
      setAlertMessage('처리에 실패했어요');
    }
  };

  const handleDelete = async () => {
    if (!loan) return;

    try {
      await deleteLoan(loan.id);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete loan:', error);
      setAlertMessage('삭제에 실패했어요');
    }
  };

  const handleSendReminder = async () => {
    if (!loan) return;

    const message = generateReminderMessage(loan);

    try {
      // apps-in-toss 공유 기능 사용
      await share({ message });
    } catch (error) {
      console.error('Failed to share reminder:', error);
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

  const [isSavingPDF, setIsSavingPDF] = useState(false);

  const handleSharePDF = async () => {
    if (!loan || isSavingPDF) return;

    setIsSavingPDF(true);

    try {
      // PDF 생성
      const pdfBlob = await generateLoanPDF(loan);

      // 파일명 (시분초로 유니크하게)
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const fileName = `빌리_${loan.borrowerName}_${h}${m}${s}.pdf`;

      // Blob을 Base64로 변환
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            // data:application/pdf;base64, 부분 제거
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(pdfBlob);
      });

      // 기기에 PDF 저장
      await saveBase64Data({
        data: base64Data,
        fileName,
        mimeType: 'application/pdf',
      });

      // 저장 완료 다이얼로그 표시
      setShowShareSuccessDialog(true);
    } catch (error) {
      console.error('PDF 저장 실패:', error);
      setAlertMessage('PDF 저장에 실패했어요');
    } finally {
      setIsSavingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <header className="app-header">
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

  return (
    <div className="page">
      <header className="app-header">
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
          <Button variant="weak" color="dark" size="large" onClick={handleSendReminder}>
            독촉하기
          </Button>
          <Button variant="fill" color="primary" size="large" onClick={() => setShowPaidBackDialog(true)}>
            받았어요
          </Button>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title={<ConfirmDialog.Title>기록 삭제</ConfirmDialog.Title>}
        description={<ConfirmDialog.Description>이 기록을 삭제할까요? 삭제하면 되돌릴 수 없어요.</ConfirmDialog.Description>}
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setShowDeleteDialog(false)}>취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton color="danger" onClick={handleDelete}>삭제</ConfirmDialog.ConfirmButton>}
      />

      {/* 상환 확인 다이얼로그 */}
      <ConfirmDialog
        open={showPaidBackDialog}
        onClose={() => setShowPaidBackDialog(false)}
        title={<ConfirmDialog.Title>상환 완료</ConfirmDialog.Title>}
        description={<ConfirmDialog.Description>{loan.borrowerName}님에게 {formatAmount(loan.amount)}원을 받으셨나요?</ConfirmDialog.Description>}
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setShowPaidBackDialog(false)}>아직이요</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={handlePaidBack}>받았어요</ConfirmDialog.ConfirmButton>}
      />

      {/* 사진 확대 보기 */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="증거사진" />
        </div>
      )}

      {/* TDS 알림 다이얼로그 */}
      <ConfirmDialog
        open={alertMessage !== null}
        onClose={() => setAlertMessage(null)}
        title={<ConfirmDialog.Title>알림</ConfirmDialog.Title>}
        description={<ConfirmDialog.Description>{alertMessage}</ConfirmDialog.Description>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => setAlertMessage(null)}>확인</ConfirmDialog.ConfirmButton>}
      />

      {/* PDF 저장 완료 다이얼로그 */}
      <ConfirmDialog
        open={showShareSuccessDialog}
        onClose={() => setShowShareSuccessDialog(false)}
        title={<ConfirmDialog.Title>저장 완료</ConfirmDialog.Title>}
        description={<ConfirmDialog.Description>PDF가 기기에 저장되었어요.</ConfirmDialog.Description>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => setShowShareSuccessDialog(false)}>확인</ConfirmDialog.ConfirmButton>}
      />
    </div>
  );
}
