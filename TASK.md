### 2025-01-17, 1 (date, is_done)
- 이미 소유한 Gem 템플릿 제외 기능 구현 ✓

#### Completed Changes:
1. `src/utils/gemGenerator.ts` 수정
   - `getTemplateByRarity(rarity, excludeIndices?)`: 소유한 템플릿 인덱스 제외
   - `generateMagicGem(origin, userInfo?, excludeTemplateIndices?)`: 제외 목록 파라미터 추가
2. `src/pages/Gacha.tsx` 수정
   - `startSummoning()`: 소유한 gem의 templateIndex 수집 및 전달
3. 엣지 케이스 처리: 해당 등급 템플릿 모두 소유 시 중복 허용 (폴백)

---

### 2025-01-16, 1 (date, is_done)
- diagnose this project to deploy in app-in-toss (ultrathink) ✓
- instead use bin files `public/gem_geometry`, using `public/gem_cads` and `scripts/prebuild-gems.mjs` , create use feature(under `src/`) ✓

#### Completed Changes:
1. Removed 416MB pre-built binary files (`public/gem_geometry/`)
2. Updated `src/utils/gemcadLoader.ts` to use runtime .asc parsing only
3. Kept 8.8MB source files (`public/gem_cads/`) for on-demand geometry generation
4. Removed `prebuild-gems` script from package.json

---

# Firebase & Multi-Slot 구현 태스크

## Phase 1: 기반 설정
- [ ] `.env` 파일 생성 (Firebase 환경변수)
- [ ] `.gitignore`에 `.env` 추가
- [ ] `src/utils/environment.ts` 생성
  - [ ] `isInTossWebView()` 함수 구현
  - [ ] `detectEnvironment()` 함수 구현
- [ ] `src/config/firebase.ts` 생성
  - [ ] Firebase 앱 초기화
  - [ ] `auth`, `db` export

## Phase 2: Storage 추상화 레이어
- [ ] `src/services/storage/types.ts` 생성
  - [ ] `GemStorageService` 인터페이스 정의
  - [ ] `getGems()`, `setGem()`, `deleteGem()` 등 메서드 정의
  - [ ] `getMaxSlots()`, `setMaxSlots()` 메서드 정의
  - [ ] `getPacksPurchased()`, `setPacksPurchased()` 메서드 정의
- [ ] `src/services/storage/LocalStorageService.ts` 생성
  - [ ] 기존 gemStore 로직을 서비스로 래핑
  - [ ] localStorage 기반 구현
- [ ] `src/services/storage/FirestoreService.ts` 생성
  - [ ] Firestore 컬렉션 구조 구현 (`users/{uid}/gems/`)
  - [ ] Firebase Auth UID 연동
  - [ ] 오프라인 캐시 설정
- [ ] `src/services/storage/index.ts` 생성
  - [ ] `getStorageService()` 팩토리 함수 구현
  - [ ] origin 기반 서비스 자동 선택

## Phase 3: 인증
- [ ] `src/services/auth/TossAuthService.ts` 생성
  - [ ] Toss Storage에서 사용자 키 관리
  - [ ] Firebase Anonymous Auth 연동 (초기 구현)
  - [ ] TODO: 백엔드 구축 시 Custom Token 방식으로 전환

## Phase 4: gemStore 확장
- [ ] `src/stores/gemStore.ts` 수정
  - [ ] `gems: Map<number, MagicGem>` 추가 (다중 슬롯)
  - [ ] `activeSlot: number` 추가
  - [ ] `maxSlots: number` 추가
  - [ ] `setGemAtSlot()` 액션 추가
  - [ ] `setActiveSlot()` 액션 추가
  - [ ] `getAvailableSlot()` 액션 추가
  - [ ] `setMaxSlots()` 액션 추가
  - [ ] v2 → v3 마이그레이션 로직 구현
- [ ] `src/types/gem.ts` 수정
  - [ ] `GemSlot` 타입 추가 (필요시)

## Phase 5: gemcadLoader 확장
- [ ] `src/utils/gemcadLoader.ts` 수정
  - [ ] `setCacheLimitBySlots(slots: number)` 함수 추가
  - [ ] 슬롯 수에 맞춰 동적 캐시 한도 설정 (1~10)

## Phase 6: 결제 서비스
- [ ] `src/services/premium/PremiumService.ts` 생성
  - [ ] `SLOT_PACK_PRODUCT_ID` 상수 정의
  - [ ] `purchaseSlotPack()` 메서드 구현
  - [ ] `getStatus()` 메서드 구현 (StorageStatus 반환)
  - [ ] `updateCacheLimit()` 내부 메서드 구현

## Phase 7: 광고 서비스
- [ ] `src/services/ads/AdService.ts` 생성
  - [ ] `REWARDED_AD_ID` 상수 정의 (개발/운영 분리)
  - [ ] `preloadRewardedAd()` 메서드 구현
  - [ ] `showRewardedAd()` 메서드 구현
  - [ ] `isAdReady()` 메서드 구현

## Phase 8: React Hooks
- [ ] `src/hooks/useStorageService.ts` 생성
  - [ ] Storage 서비스 인스턴스 제공
  - [ ] 초기화 상태 관리
- [ ] `src/hooks/useAuth.ts` 생성
  - [ ] 인증 상태 관리
  - [ ] userId 제공
- [ ] `src/hooks/usePremium.ts` 생성
  - [ ] StorageStatus 상태 관리
  - [ ] `buySlotPack()` 함수 제공
  - [ ] `refresh()` 함수 제공

## Phase 9: UI 업데이트
- [ ] `src/pages/Home.tsx` 수정
  - [ ] GemStorage 컴포넌트 추가
  - [ ] gem 그리드 렌더링 (소유 gem + 빈 슬롯)
  - [ ] 슬롯 팩 구매 버튼 (최대 3회까지)
  - [ ] gem 선택 시 상세 페이지 이동
- [ ] `src/pages/Home.module.css` 수정
  - [ ] `.gemStorage` 스타일
  - [ ] `.gemGrid` 스타일
  - [ ] `.gemSlot`, `.emptySlot` 스타일
  - [ ] `.buySlotButton` 스타일
- [ ] `src/pages/Gacha.tsx` 수정
  - [ ] 슬롯 선택 UI (빈 슬롯 or 교체할 슬롯)
  - [ ] gem 교체 시 광고 시청 플로우
  - [ ] `adService.showRewardedAd()` 호출
  - [ ] 광고 완료 후 gem 소환 진행

## Phase 10: 검증
- [ ] `npm run build` - 타입 에러 없음 확인
- [ ] 로컬 개발 테스트 (non-Toss 환경)
  - [ ] localStorage 저장 확인
  - [ ] 다중 슬롯 동작 확인
- [ ] Toss 환경 시뮬레이션
  - [ ] `isInTossWebView()` 강제 true 설정
  - [ ] Firebase Console에서 Firestore 데이터 확인
- [ ] 광고 테스트 (테스트 ID 사용)
  - [ ] 광고 로드 성공 확인
  - [ ] 광고 시청 완료 후 gem 교체 진행 확인

## 운영 배포 전 체크리스트
- [ ] Firebase Console에서 Firestore Security Rules 설정
- [ ] Firebase Console에서 허용 도메인 설정
- [ ] Toss IAP Console에서 상품 등록 (`gem_slots_pack_3`)
- [ ] Toss Ads Console에서 광고 그룹 생성 (보상형)
- [ ] `.env` 운영 환경변수 설정
- [ ] 광고 ID를 테스트 → 운영으로 교체
