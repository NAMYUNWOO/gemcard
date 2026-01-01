// GemCad .asc 파일명 (예: 'pc01006')
export type GemShape = string;

export interface GemParams {
  id: string;
  shape: GemShape;
  color: string;
  turbidity: number;
  detailLevel: number;
  dispersion: number;
  thickness: number;
}

export interface CardMessage {
  content: string;
  senderName?: string;
  createdAt: number;
}

export interface GemCard {
  id: string;
  gem: Omit<GemParams, 'id'>;
  message: CardMessage;
}

// GemCad 파일 목록 캐시
let gemCadList: string[] | null = null;

// 컷 이름 캐시
const cutNameCache = new Map<string, string>();

// 컷 이름 가져오기
export async function getCutName(shapeId: string): Promise<string> {
  if (cutNameCache.has(shapeId)) {
    return cutNameCache.get(shapeId)!;
  }

  try {
    const fileName = shapeId.endsWith('.asc') ? shapeId : `${shapeId}.asc`;
    const response = await fetch(`/gem_cads/${fileName}`);
    const content = await response.text();

    // H 라인에서 컷 이름 추출
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('H ')) {
        const fullText = line.trim().slice(2);
        // PC 08.087D 같은 패턴도 처리 (숫자 뒤에 문자 포함)
        const match = fullText.match(/^[A-Z]{2}\s*[\d.]+[A-Z]?\s+(.+)$/);
        const name = match ? match[1].trim() : fullText;
        cutNameCache.set(shapeId, name);
        return name;
      }
    }
    return 'Unknown Cut';
  } catch (e) {
    console.error('Failed to get cut name:', e);
    return 'Unknown Cut';
  }
}

// GemCad 파일 목록 로드
export async function loadGemCadList(): Promise<string[]> {
  if (gemCadList) return gemCadList;

  try {
    const response = await fetch('/gem_cads/index.json');
    gemCadList = await response.json();
    return gemCadList!;
  } catch (e) {
    console.error('Failed to load gem_cads index:', e);
    // fallback
    return ['pc01006', 'pc01024', 'pc01042', 'pc03006'];
  }
}

// 랜덤 GemCad shape 선택
export async function getRandomShape(): Promise<string> {
  const list = await loadGemCadList();
  return list[Math.floor(Math.random() * list.length)];
}

// 동기적 랜덤 선택 (목록이 이미 로드된 경우)
export function getRandomShapeSync(): string {
  if (!gemCadList || gemCadList.length === 0) {
    return 'pc01006'; // fallback
  }
  return gemCadList[Math.floor(Math.random() * gemCadList.length)];
}

export const DEFAULT_GEM_PARAMS: Omit<GemParams, 'id'> = {
  shape: 'pc01006', // 기본값, 실제로는 랜덤으로 설정됨
  color: '#ffffff',
  turbidity: 0,
  detailLevel: 0,
  dispersion: 0.05,
  thickness: 1.5,
};

export const COLOR_OPTIONS = [
  '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe',
  '#fd79a8', '#00b894',
];
