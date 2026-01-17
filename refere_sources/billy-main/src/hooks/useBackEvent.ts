import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { graniteEvent, closeView } from '@apps-in-toss/web-framework';

/**
 * apps-in-toss 공통 내비게이션 백버튼 이벤트 처리 훅
 * - 스킴 직접 진입(location.key === 'default')이면 앱 종료
 * - 앱 내 네비게이션으로 이동한 경우 뒤로가기
 */
export function useBackEvent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        // 스킴 직접 진입 시 location.key는 'default'
        // 앱 내 네비게이션 시 location.key는 랜덤 문자열
        if (location.key === 'default') {
          closeView();
        } else {
          navigate(-1);
        }
      },
      onError: (error) => {
        console.error('Back event error:', error);
      },
    });

    return cleanup;
  }, [location.key, navigate]);
}
