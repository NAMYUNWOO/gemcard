import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfirmDialog } from '@toss/tds-mobile';
import { createLoan } from '../lib/db';
import { compressImages, getImageSizeKB } from '../lib/imageUtils';
import { useBackEvent } from '../hooks/useBackEvent';

export default function AddLoan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [borrowerName, setBorrowerName] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // 공통 내비게이션 백버튼 이벤트 처리
  useBackEvent();

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const compressed = await compressImages(files);
      setPhotos((prev) => [...prev, ...compressed]);
    } catch (error) {
      console.error('Failed to compress images:', error);
      setAlertMessage('이미지 처리에 실패했어요');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!borrowerName.trim()) {
      setAlertMessage('누구에게 빌려줬는지 입력해주세요');
      return;
    }

    const parsedAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) {
      setAlertMessage('금액을 입력해주세요');
      return;
    }

    setSaving(true);

    try {
      await createLoan({
        borrowerName: borrowerName.trim(),
        amount: parsedAmount,
        interestRate: parseFloat(interestRate) || 0,
        loanDate,
        dueDate: dueDate || undefined,
        memo: memo.trim() || undefined,
        photos,
      });

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to save loan:', error);
      setAlertMessage('저장에 실패했어요');
    } finally {
      setSaving(false);
    }
  };

  const formatAmountInput = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (!numbers) return '';
    return new Intl.NumberFormat('ko-KR').format(parseInt(numbers, 10));
  };

  const getTotalPhotoSize = () => {
    const totalKB = photos.reduce((sum, photo) => sum + getImageSizeKB(photo), 0);
    if (totalKB < 1024) return `${totalKB}KB`;
    return `${(totalKB / 1024).toFixed(1)}MB`;
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    border: '1px solid #D1D6DB',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  };

  return (
    <div className="page">
      <header className="app-header">
        <h1>기록하기</h1>
      </header>

      <div className="content form-content">
        <div className="form-group">
          <label className="form-label">누구에게?</label>
          <input
            style={inputStyle}
            placeholder="이름을 입력하세요"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">얼마?</label>
          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              placeholder="금액을 입력하세요"
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(e.target.value))}
              inputMode="numeric"
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B95A1' }}>원</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">이자율 (연)</label>
          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              placeholder="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B95A1' }}>%</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">빌려준 날</label>
          <input
            type="date"
            className="date-input"
            value={loanDate}
            onChange={(e) => setLoanDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">갚기로 한 날 (선택)</label>
          <input
            type="date"
            className="date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">메모 (선택)</label>
          <input
            style={inputStyle}
            placeholder="상황을 간단히 적어두세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {/* 증거사진 */}
        <div className="form-group">
          <label className="form-label">증거사진 (선택)</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo} alt={`증거사진 ${index + 1}`} />
                <button
                  className="photo-remove"
                  onClick={() => removePhoto(index)}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              className="photo-add"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>+</span>
              <span className="photo-add-text">사진 추가</span>
            </button>
          </div>

          {photos.length > 0 && (
            <p className="photo-size-info">
              {photos.length}장 · {getTotalPhotoSize()}
            </p>
          )}
        </div>
      </div>

      <div className="bottom-button">
        <Button
          variant="fill"
          color="primary"
          size="large"
          display="full"
          onClick={handleSubmit}
          disabled={saving || !borrowerName.trim() || !amount}
          loading={saving}
        >
          저장하기
        </Button>
      </div>

      {/* TDS 알림 다이얼로그 */}
      <ConfirmDialog
        open={alertMessage !== null}
        onClose={() => setAlertMessage(null)}
        title={<ConfirmDialog.Title>알림</ConfirmDialog.Title>}
        description={<ConfirmDialog.Description>{alertMessage}</ConfirmDialog.Description>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => setAlertMessage(null)}>확인</ConfirmDialog.ConfirmButton>}
      />
    </div>
  );
}
