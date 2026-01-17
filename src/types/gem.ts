/**
 * Arcane Gems - Type Definitions
 */

// =============================================================================
// Localization (must be first for type references)
// =============================================================================

export type SupportedLocale = 'ko' | 'en' | 'zh' | 'ja' | 'es';

export interface LocalizedDescriptions {
  ko: string;
  en?: string;
  zh?: string;
  ja?: string;
  es?: string;
}

// =============================================================================
// Magic Circle System
// =============================================================================

export interface MagicCircle {
  id: number;           // 17-20
  name: Record<SupportedLocale, string>;
  meaning: Record<SupportedLocale, string>;
}

export const MAGIC_CIRCLES: MagicCircle[] = [
  {
    id: 17,
    name: {
      ko: '현자의 돌 봉인',
      en: 'Seal of the Philosopher\'s Stone',
      zh: '贤者之石封印',
      ja: '賢者の石の封印',
      es: 'Sello de la Piedra Filosofal',
    },
    meaning: {
      ko: '연금술 대가들이 새긴 신성한 변환의 공식',
      en: 'The sacred formula of transmutation, inscribed by the masters of alchemy',
      zh: '炼金术大师铭刻的神圣转化公式',
      ja: '錬金術の達人が刻んだ神聖なる変換の公式',
      es: 'La fórmula sagrada de transmutación, inscrita por los maestros de la alquimia',
    },
  },
  {
    id: 18,
    name: {
      ko: '천상 궁의 바퀴',
      en: 'Wheel of the Celestial Houses',
      zh: '天宫之轮',
      ja: '天宮の輪',
      es: 'Rueda de las Casas Celestiales',
    },
    meaning: {
      ko: '열두 별자리와 일곱 떠도는 별을 엮는 황도대의 수레바퀴',
      en: 'The zodiac wheel that binds the twelve constellations and seven wandering stars',
      zh: '连接十二星座与七颗游星的黄道之轮',
      ja: '十二の星座と七つの惑星を結ぶ黄道帯の車輪',
      es: 'La rueda zodiacal que une las doce constelaciones y siete estrellas errantes',
    },
  },
  {
    id: 19,
    name: {
      ko: '태초 소용돌이의 인장',
      en: 'Sigil of the Primordial Spiral',
      zh: '太初漩涡之印',
      ja: '原初の渦の印章',
      es: 'Sigilo de la Espiral Primordial',
    },
    meaning: {
      ko: '고대 문자를 통해 생명 에너지의 흐름을 인도하는 동방의 인장',
      en: 'An eastern seal channeling the flow of vital energy through ancient script',
      zh: '通过古老文字引导生命能量流动的东方印章',
      ja: '古代文字を通じて生命エネルギーの流れを導く東方の印章',
      es: 'Un sello oriental que canaliza el flujo de energía vital a través de escritura antigua',
    },
  },
  {
    id: 20,
    name: {
      ko: '룬 직조의 원',
      en: 'Circle of the Runic Weave',
      zh: '符文织纹之环',
      ja: 'ルーン織りの円',
      es: 'Círculo del Tejido Rúnico',
    },
    meaning: {
      ko: '켈트 매듭으로 묶인 북유럽 룬, 북방 왕국의 지혜를 잇는 다리',
      en: 'Nordic runes bound by Celtic knots, bridging the wisdom of the northern realms',
      zh: '凯尔特结编织的北欧符文，连接北方王国的智慧之桥',
      ja: 'ケルトの結び目で結ばれた北欧ルーン、北の王国の知恵を繋ぐ架け橋',
      es: 'Runas nórdicas unidas por nudos celtas, puente de la sabiduría de los reinos del norte',
    },
  },
];

export function getMagicCircleName(circle: MagicCircle, locale: SupportedLocale = 'ko'): string {
  return circle.name[locale] ?? circle.name.ko;
}

export function getMagicCircleMeaning(circle: MagicCircle, locale: SupportedLocale = 'ko'): string {
  return circle.meaning[locale] ?? circle.meaning.ko;
}

export function getRandomMagicCircle(): MagicCircle {
  return MAGIC_CIRCLES[Math.floor(Math.random() * MAGIC_CIRCLES.length)];
}

export function getMagicCircleById(id: number): MagicCircle | undefined {
  return MAGIC_CIRCLES.find(c => c.id === id);
}

// =============================================================================
// Rarity System
// =============================================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_CHANCES: Record<Rarity, number> = {
  common: 0.50,
  uncommon: 0.30,
  rare: 0.15,
  epic: 0.04,
  legendary: 0.01,
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_LABELS: Record<Rarity, Record<SupportedLocale, string>> = {
  common: { ko: '일반', en: 'Common', zh: '普通', ja: 'コモン', es: 'Común' },
  uncommon: { ko: '고급', en: 'Uncommon', zh: '稀有', ja: 'アンコモン', es: 'Poco común' },
  rare: { ko: '희귀', en: 'Rare', zh: '精良', ja: 'レア', es: 'Raro' },
  epic: { ko: '영웅', en: 'Epic', zh: '史诗', ja: 'エピック', es: 'Épico' },
  legendary: { ko: '전설', en: 'Legendary', zh: '传说', ja: 'レジェンダリー', es: 'Legendario' },
};

export function getRarityLabel(rarity: Rarity, locale: SupportedLocale = 'ko'): string {
  return RARITY_LABELS[rarity][locale] ?? RARITY_LABELS[rarity].ko;
}

// =============================================================================
// Element System
// =============================================================================

export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'darkness' | 'spirit' | 'mind';

export const ELEMENT_ICONS: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  wind: '💨',
  light: '✨',
  darkness: '🌑',
  spirit: '👻',
  mind: '🧠',
};

export const ELEMENT_LABELS: Record<Element, Record<SupportedLocale, string>> = {
  fire: { ko: '불', en: 'Fire', zh: '火', ja: '火', es: 'Fuego' },
  water: { ko: '물', en: 'Water', zh: '水', ja: '水', es: 'Agua' },
  earth: { ko: '대지', en: 'Earth', zh: '地', ja: '地', es: 'Tierra' },
  wind: { ko: '바람', en: 'Wind', zh: '风', ja: '風', es: 'Viento' },
  light: { ko: '빛', en: 'Light', zh: '光', ja: '光', es: 'Luz' },
  darkness: { ko: '어둠', en: 'Darkness', zh: '暗', ja: '闇', es: 'Oscuridad' },
  spirit: { ko: '영혼', en: 'Spirit', zh: '灵', ja: '霊', es: 'Espíritu' },
  mind: { ko: '정신', en: 'Mind', zh: '心', ja: '精神', es: 'Mente' },
};

export function getElementLabel(element: Element, locale: SupportedLocale = 'ko'): string {
  return ELEMENT_LABELS[element][locale] ?? ELEMENT_LABELS[element].ko;
}

/**
 * Get localized description from MagicPower
 */
export function getLocalizedDescription(
  magicPower: MagicPower,
  locale: SupportedLocale = 'ko'
): string {
  return magicPower.descriptions?.[locale] ?? magicPower.description;
}

/**
 * Get localized title from MagicPower
 */
export function getLocalizedTitle(
  magicPower: MagicPower,
  locale: SupportedLocale = 'ko'
): string {
  return magicPower.titles?.[locale] ?? magicPower.title;
}

/**
 * Get localized name from MagicGem
 */
export function getLocalizedName(
  gem: { name: string; names?: LocalizedDescriptions },
  locale: SupportedLocale = 'ko'
): string {
  return gem.names?.[locale] ?? gem.name;
}

// =============================================================================
// Magic Power
// =============================================================================

export interface MagicPower {
  title: string;
  titles?: LocalizedDescriptions;
  description: string;  // Default (Korean)
  descriptions?: LocalizedDescriptions;
  element?: Element;
}

// =============================================================================
// User Info
// =============================================================================

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface BirthDateTime {
  date: string;      // YYYY-MM-DD format
  hour?: number;     // 0-23
  minute?: number;   // 0-59
  second?: number;   // 0-59
}

export interface UserInfo {
  name?: string;
  gender?: Gender;
  birthdate?: BirthDateTime;
}

/**
 * Validates that at least one field in UserInfo is filled
 */
export function isValidUserInfo(info: UserInfo): boolean {
  return !!(
    info.name?.trim() ||
    info.gender ||
    info.birthdate?.date
  );
}

export const GENDER_LABELS: Record<Gender, Record<SupportedLocale, string>> = {
  'male': { ko: '남성', en: 'Male', zh: '男', ja: '男性', es: 'Masculino' },
  'female': { ko: '여성', en: 'Female', zh: '女', ja: '女性', es: 'Femenino' },
  'other': { ko: '기타', en: 'Other', zh: '其他', ja: 'その他', es: 'Otro' },
  'prefer-not-to-say': { ko: '밝히고 싶지 않음', en: 'Prefer not to say', zh: '不愿透露', ja: '回答しない', es: 'Prefiero no decir' },
};

export function getGenderLabel(gender: Gender, locale: SupportedLocale = 'ko'): string {
  return GENDER_LABELS[gender][locale] ?? GENDER_LABELS[gender].ko;
}

// =============================================================================
// Magic Gem
// =============================================================================

export type GemOrigin = 'gacha' | 'exchange' | 'gift';

export interface MagicGem {
  id: string;

  // Visual properties (compatible with existing GemScene)
  shape: string;      // GemCad file name
  color: string;      // Hex color
  turbidity: number;  // Opacity 0~1
  contrast: number;   // Internal contrast 0.5~1

  // Magic properties
  name: string;           // Gem name (default Korean)
  names?: LocalizedDescriptions;  // Localized gem names
  magicPower: MagicPower;
  rarity: Rarity;
  magicCircle: MagicCircle;  // Associated magic circle

  // Template index (for efficient URL sharing)
  templateIndex?: number;  // Index in SAMPLE_GEM_TEMPLATES array

  // User info (stored with gem, doesn't affect generation)
  userInfo?: UserInfo;

  // Metadata
  obtainedAt: number;  // Timestamp
  origin: GemOrigin;
}

// =============================================================================
// Sample Gem Template (for generation)
// =============================================================================

export interface SampleGemTemplate {
  name: string;
  names?: LocalizedDescriptions;
  magicPower: MagicPower & {
    titles?: LocalizedDescriptions;
  };
  rarity: Rarity;
}

// =============================================================================
// Utility Types
// =============================================================================

export type GemVisualParams = Pick<MagicGem, 'shape' | 'color' | 'turbidity' | 'contrast'>;

export function getRarityClass(rarity: Rarity): string {
  return `rarity-${rarity}`;
}
