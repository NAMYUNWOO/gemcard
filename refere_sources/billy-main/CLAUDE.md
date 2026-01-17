# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

빌리(Billy) is a casual personal loan tracking app built as a Toss mini-app (apps-in-toss). It allows users to record money lent to friends, track repayments, store evidence photos, and send reminder messages.

## Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Apps-in-Toss Sandbox Testing

1. Install the 앱인토스 샌드박스 app on your device
2. Ensure device and computer are on the same Wi-Fi
3. Run `npm run dev` (server binds to 0.0.0.0:5173)
4. In sandbox app: login → select app → enter server address (e.g., `192.168.x.x:5173`)
5. Access via scheme: `intoss://billy`

**Note**: `TDSMobileAITProvider` requires the apps-in-toss sandbox environment. It will error in regular browsers.

## Architecture

### Tech Stack
- React 18 + TypeScript + Vite
- TDS Mobile components (`@toss/tds-mobile`) with `TDSMobileAITProvider`
- IndexedDB for local data persistence
- `@apps-in-toss/web-framework` for Toss mini-app integration
- jsPDF + Canvas API for PDF generation with Korean support

### Key Files

| Path | Purpose |
|------|---------|
| `granite.config.ts` | Apps-in-toss configuration (appName, brand, permissions, bridgeColorMode) |
| `src/main.tsx` | App entry point with TDSMobileAITProvider |
| `src/lib/db.ts` | IndexedDB CRUD operations for loans |
| `src/lib/imageUtils.ts` | Image compression (800px max, 70% JPEG quality) |
| `src/lib/pdfGenerator.ts` | PDF generation with Korean text (Canvas API) and evidence photos |
| `src/types/loan.ts` | Loan data type definitions |

### Data Flow
- All loan data stored locally in IndexedDB (`billy-db`)
- Evidence photos compressed to Base64 and stored in IndexedDB
- No backend server - fully client-side storage

### Routing & Deep Links

Uses `BrowserRouter` (react-router-dom) for clean URLs compatible with apps-in-toss deep links.

| Route | Page | Deep Link |
|-------|------|-----------|
| `/` | Home: loan list with summary | `intoss://billy/` |
| `/add` | AddLoan: create new loan record | `intoss://billy/add` |
| `/loan/:id` | LoanDetail: view details, mark paid, send reminder | - |

### PDF Sharing Feature
- Uses Canvas API to render Korean text (jsPDF doesn't support Korean fonts natively)
- Creates single-page PDF with dynamic height to include all photos
- Calculates accrued interest based on loan date and annual rate
- Shares via Web Share API

### TDS Mobile Usage

This project uses TDS Mobile components (`@toss/tds-mobile`, `@toss/tds-mobile-ait`).

#### TDS 흰화면 이슈 및 해결

**문제:** `TDSMobileAITProvider`로 감싸면 샌드박스에서 흰화면 발생
```
Error: brandBridgeColorMode is not a constant handler
```

**원인:** SDK 1.6.1에서 `bridgeColorMode` 기능이 제거되었으나, TDS 2.2.0은 여전히 호출 시도

**해결 방법:**

1. **SDK 버전 고정** (`package.json`)
```json
{
  "dependencies": {
    "@apps-in-toss/web-framework": "1.6.0"  // 캐럿(^) 제거, 1.6.0 고정
  }
}
```

2. **bridgeColorMode 설정** (`granite.config.ts`)
```typescript
brand: {
  bridgeColorMode: 'inverted',  // 'basic' | 'inverted'
}
```

3. **TDSMobileAITProvider 적용** (`src/main.tsx`)
```typescript
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

createRoot(document.getElementById('root')!).render(
  <TDSMobileAITProvider>
    <App />
  </TDSMobileAITProvider>
);
```

#### 동적 IP 설정

WiFi 변경 시 IP 자동 감지 (`granite.config.ts`):
```typescript
import { networkInterfaces } from 'os';

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of ['en0', 'eth0', 'wlan0']) {
    if (nets[name]) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

export default defineConfig({
  web: {
    host: getLocalIP(),
    port: 5173,
  },
});
```

#### TDS Components in use

| Component | Usage | Props |
|-----------|-------|-------|
| `Button` | 모든 버튼 | `variant="fill"\|"weak"`, `color="primary"\|"dark"\|"danger"`, `size`, `display` |
| `ConfirmDialog` | 삭제/상환 확인 | `open`, `onClose`, `title`, `description`, `cancelButton`, `confirmButton` |

**Note:** TDS does not provide TextField/TextInput. Use plain HTML `<input>` elements.

### 뒤로가기(backEvent) 이벤트 처리

apps-in-toss WebView에서 공통 내비게이션 뒤로가기 버튼 이벤트를 처리하는 방법.

#### 문제

스킴(`intoss://앱이름/경로`)으로 특정 페이지에 직접 진입 시 뒤로가기 버튼이 무반응.

#### 원인

`window.history.length`는 WebView에서 신뢰할 수 없음. 토스 앱 WebView 자체 히스토리가 포함되어 스킴 직접 진입해도 1보다 클 수 있음.

#### 해결

React Router의 `location.key`로 스킴 직접 진입 여부 판단:
- 스킴 직접 진입 시: `location.key === 'default'`
- 앱 내 네비게이션 시: `location.key`는 랜덤 문자열

```typescript
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { graniteEvent, closeView } from '@apps-in-toss/web-framework';

export function useBackEvent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const cleanup = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        if (location.key === 'default') {
          closeView();  // 스킴 직접 진입 → 앱 종료
        } else {
          navigate(-1); // 앱 내 이동 → 이전 페이지
        }
      },
      onError: (error) => console.error('Back event error:', error),
    });
    return cleanup;
  }, [location.key, navigate]);
}
```

각 페이지 컴포넌트에서 `useBackEvent()` 훅 호출하여 사용.

### Known Issues
- `html2canvas` causes "Unable to open URL: about:blank" error in WebView - use Canvas API directly instead

## Apps-in-Toss Release Info

### 출시 노트 (Release Note)
> 친구에게 빌려준 돈을 간편하게 기록하고 관리할 수 있는 앱이에요. 홈에서는 빌려준 돈 목록과 총액을 보고, 증거사진을 첨부하고, 독촉 메시지를 보낼 수 있어요.

### 앱 내 기능 (App Features for Registration)

| 한국어 기능 이름 | 영어 기능 이름 | 이동 URL |
|-----------------|---------------|----------|
| 빌려준 돈 목록 | Loan List | `intoss://billy/` |
| 빌려준 돈 기록하기 | Add Loan Record | `intoss://billy/add` |

### 주요 기능 요약
1. **빌려준 돈 기록** - 이름, 금액, 이자율, 날짜, 메모 입력
2. **증거사진 첨부** - 카톡 캡처, 차용증 등 사진 저장
3. **독촉 메시지 전송** - 랜덤 독촉 문구 생성 후 공유
4. **PDF 공유** - 대출 기록을 PDF로 만들어 공유
5. **상환 관리** - 받았어요 버튼으로 상환 완료 처리
