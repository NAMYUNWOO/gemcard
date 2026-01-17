interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const handleStart = () => {
    onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px 24px 24px',
    }}>
      {/* 앱 아이콘 및 이동 메시지 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #3182F6, #1B64DA)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(49, 130, 246, 0.3)',
        }}>
          <span style={{ fontSize: 36 }}>💰</span>
        </div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#191F28',
          margin: 0,
        }}>
          <span style={{ color: '#3182F6' }}>빌리</span>로 이동했어요
        </h1>
      </div>

      {/* 앱 설명 이미지/아이콘 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 48,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: '#F4F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}>📝</div>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: '#F4F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}>📸</div>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: '#F4F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}>📤</div>
      </div>

      {/* 사용 방법 */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 14,
          color: '#8B95A1',
          marginBottom: 20,
        }}>이렇게 사용해요</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F4F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#8B95A1',
              flexShrink: 0,
            }}>1</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28', margin: '0 0 4px' }}>
                빌려준 돈 기록하기
              </p>
              <p style={{ fontSize: 14, color: '#8B95A1', margin: 0 }}>
                누구에게, 얼마를, 언제 빌려줬는지 기록해요
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F4F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#8B95A1',
              flexShrink: 0,
            }}>2</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28', margin: '0 0 4px' }}>
                증거사진 첨부하기
              </p>
              <p style={{ fontSize: 14, color: '#8B95A1', margin: 0 }}>
                카톡 캡처, 차용증 등 증거를 함께 저장해요
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F4F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#8B95A1',
              flexShrink: 0,
            }}>3</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28', margin: '0 0 4px' }}>
                독촉 메시지 보내기
              </p>
              <p style={{ fontSize: 14, color: '#8B95A1', margin: 0 }}>
                갚을 때가 되면 부드럽게 독촉해요
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F4F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: '#8B95A1',
              flexShrink: 0,
            }}>4</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28', margin: '0 0 4px' }}>
                PDF로 공유하기
              </p>
              <p style={{ fontSize: 14, color: '#8B95A1', margin: 0 }}>
                대출 기록을 PDF로 만들어 공유할 수 있어요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}
        style={{
          width: '100%',
          padding: 16,
          fontSize: 16,
          fontWeight: 600,
          background: '#3182F6',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          marginTop: 24,
        }}
      >
        시작하기
      </button>
    </div>
  );
}
