import type { SupportedLocale } from '../types/gem';

export interface Translations {
  // Common
  appName: string;
  home: string;
  share: string;
  copied: string;
  returnHome: string;
  goHome: string;

  // Rarity
  rarityCommon: string;
  rarityUncommon: string;
  rarityRare: string;
  rarityEpic: string;
  rarityLegendary: string;

  // Elements
  elementFire: string;
  elementWater: string;
  elementEarth: string;
  elementWind: string;
  elementLight: string;
  elementDarkness: string;
  elementSpirit: string;
  elementMind: string;

  // Gender
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  genderPreferNotToSay: string;

  // Magic Circles
  magicCircle17Name: string;
  magicCircle17Meaning: string;
  magicCircle18Name: string;
  magicCircle18Meaning: string;
  magicCircle19Name: string;
  magicCircle19Meaning: string;
  magicCircle20Name: string;
  magicCircle20Meaning: string;

  // Home Page
  homeTitle: string;
  homeSubtitle: string;
  homeDescription: string;
  summonYourGem: string;
  yourGem: string;
  viewDetails: string;
  summonNewGem: string;
  bondedTo: string;
  element: string;
  gemOwned: string;

  // Gacha Page
  gachaTitle: string;
  gachaSubtitle: string;
  formName: string;
  formNamePlaceholder: string;
  formGender: string;
  formSelectGender: string;
  formBirthDate: string;
  formYear: string;
  formMonth: string;
  formDay: string;
  formBirthTime: string;
  formHour: string;
  formMinute: string;
  formSecond: string;
  formOptional: string;
  formError: string;
  summonButton: string;
  summoning: string;
  summoningMessage: string;
  acceptAndGoHome: string;

  // Replace Confirmation
  replaceTitle: string;
  replaceMessage: string;
  replaceCurrentGem: string;
  replaceWarning: string;
  replaceCancel: string;
  replaceConfirm: string;

  // Gem Detail Page
  gemNotFound: string;
  gemNotFoundMessage: string;
  sealedBy: string;
  born: string;
  obtained: string;
  origin: string;
  originGacha: string;
  originExchange: string;
  originGift: string;

  // Shared Gem Page
  invalidLink: string;
  invalidLinkMessage: string;
  sharedGem: string;
  someoneGem: string;
  summonYourOwn: string;
}

const ko: Translations = {
  // Common
  appName: '아케인 젬',
  home: '홈',
  share: '공유',
  copied: '복사됨!',
  returnHome: '홈으로 돌아가기',
  goHome: '홈으로',

  // Rarity
  rarityCommon: '일반',
  rarityUncommon: '고급',
  rarityRare: '희귀',
  rarityEpic: '영웅',
  rarityLegendary: '전설',

  // Elements
  elementFire: '불',
  elementWater: '물',
  elementEarth: '대지',
  elementWind: '바람',
  elementLight: '빛',
  elementDarkness: '어둠',
  elementSpirit: '영혼',
  elementMind: '정신',

  // Gender
  genderMale: '남성',
  genderFemale: '여성',
  genderOther: '기타',
  genderPreferNotToSay: '밝히고 싶지 않음',

  // Magic Circles
  magicCircle17Name: '현자의 돌 봉인',
  magicCircle17Meaning: '연금술 대가들이 새긴 신성한 변환의 공식',
  magicCircle18Name: '천상 궁의 바퀴',
  magicCircle18Meaning: '열두 별자리와 일곱 떠도는 별을 엮는 황도대의 수레바퀴',
  magicCircle19Name: '태초 소용돌이의 인장',
  magicCircle19Meaning: '고대 문자를 통해 생명 에너지의 흐름을 인도하는 동방의 인장',
  magicCircle20Name: '룬 직조의 원',
  magicCircle20Meaning: '켈트 매듭으로 묶인 북유럽 룬, 북방 왕국의 지혜를 잇는 다리',

  // Home Page
  homeTitle: '아케인 젬',
  homeSubtitle: '당신의 운명이 결정화되기를 기다리고 있습니다...',
  homeDescription: '당신의 본질에 결속된 신비로운 보석을 소환하세요. 이름, 생년월일, 또는 본질의 일부를 나누어 우주가 당신만의 마법 결정을 만들 수 있게 하세요.',
  summonYourGem: '보석 소환하기',
  yourGem: '나의 보석',
  viewDetails: '자세히 보기',
  summonNewGem: '새 보석 소환',
  bondedTo: '결속자',
  element: '속성',
  gemOwned: '보석 1개 보유',

  // Gacha Page
  gachaTitle: '보석 소환하기',
  gachaSubtitle: '운명을 결정화하기 위해 당신의 본질을 나눠주세요...',
  formName: '이름',
  formNamePlaceholder: '이름을 입력하세요',
  formGender: '성별',
  formSelectGender: '성별 선택',
  formBirthDate: '생년월일',
  formYear: '년',
  formMonth: '월',
  formDay: '일',
  formBirthTime: '출생 시간',
  formHour: '시',
  formMinute: '분',
  formSecond: '초',
  formOptional: '선택사항',
  formError: '최소 하나의 필드를 입력해주세요',
  summonButton: '소환',
  summoning: '소환 중',
  summoningMessage: '고대의 힘이 일어나고 있습니다...',
  acceptAndGoHome: '확인 후 홈으로',

  // Replace Confirmation
  replaceTitle: '보석 교체',
  replaceMessage: '이미 보석을 보유하고 있습니다',
  replaceCurrentGem: '현재 보석',
  replaceWarning: '새 보석을 소환하면 현재 보석이 영원히 사라집니다. 계속하시겠습니까?',
  replaceCancel: '취소',
  replaceConfirm: '새 보석 소환',

  // Gem Detail Page
  gemNotFound: '보석을 찾을 수 없음',
  gemNotFoundMessage: '이 보석은 허공으로 사라졌습니다...',
  sealedBy: '봉인자',
  born: '탄생',
  obtained: '획득일',
  origin: '출처',
  originGacha: '소환',
  originExchange: '교환',
  originGift: '선물',

  // Shared Gem Page
  invalidLink: '잘못된 링크',
  invalidLinkMessage: '이 보석 링크가 유효하지 않거나 손상되었습니다.',
  sharedGem: '공유된 보석',
  someoneGem: '의 보석',
  summonYourOwn: '나만의 보석 소환하기',
};

const en: Translations = {
  // Common
  appName: 'Arcane Gems',
  home: 'Home',
  share: 'Share',
  copied: 'Copied!',
  returnHome: 'Return Home',
  goHome: 'Go Home',

  // Rarity
  rarityCommon: 'Common',
  rarityUncommon: 'Uncommon',
  rarityRare: 'Rare',
  rarityEpic: 'Epic',
  rarityLegendary: 'Legendary',

  // Elements
  elementFire: 'Fire',
  elementWater: 'Water',
  elementEarth: 'Earth',
  elementWind: 'Wind',
  elementLight: 'Light',
  elementDarkness: 'Darkness',
  elementSpirit: 'Spirit',
  elementMind: 'Mind',

  // Gender
  genderMale: 'Male',
  genderFemale: 'Female',
  genderOther: 'Other',
  genderPreferNotToSay: 'Prefer not to say',

  // Magic Circles
  magicCircle17Name: 'Seal of the Philosopher\'s Stone',
  magicCircle17Meaning: 'The sacred formula of transmutation, inscribed by the masters of alchemy',
  magicCircle18Name: 'Wheel of the Celestial Houses',
  magicCircle18Meaning: 'The zodiac wheel that binds the twelve constellations and seven wandering stars',
  magicCircle19Name: 'Sigil of the Primordial Spiral',
  magicCircle19Meaning: 'An eastern seal channeling the flow of vital energy through ancient script',
  magicCircle20Name: 'Circle of the Runic Weave',
  magicCircle20Meaning: 'Nordic runes bound by Celtic knots, bridging the wisdom of the northern realms',

  // Home Page
  homeTitle: 'Arcane Gems',
  homeSubtitle: 'Your destiny awaits crystallization...',
  homeDescription: 'Summon a mystical gem bound to your essence. Share your name, birth date, or a fragment of your being, and let the cosmos forge a magical crystal uniquely yours.',
  summonYourGem: 'Summon Your Gem',
  yourGem: 'Your Gem',
  viewDetails: 'View Details',
  summonNewGem: 'Summon New Gem',
  bondedTo: 'Bonded to',
  element: 'Element',
  gemOwned: '1 Gem Owned',

  // Gacha Page
  gachaTitle: 'Summon Your Gem',
  gachaSubtitle: 'Share your essence to crystallize destiny...',
  formName: 'Name',
  formNamePlaceholder: 'Enter your name',
  formGender: 'Gender',
  formSelectGender: 'Select gender',
  formBirthDate: 'Birth Date',
  formYear: 'Year',
  formMonth: 'MM',
  formDay: 'DD',
  formBirthTime: 'Birth Time',
  formHour: 'HH',
  formMinute: 'MM',
  formSecond: 'SS',
  formOptional: 'Optional',
  formError: 'Please fill in at least one field',
  summonButton: 'Summon',
  summoning: 'Summoning',
  summoningMessage: 'Ancient forces stir...',
  acceptAndGoHome: 'Accept & Go Home',

  // Replace Confirmation
  replaceTitle: 'Replace Gem',
  replaceMessage: 'You already have a gem',
  replaceCurrentGem: 'Current Gem',
  replaceWarning: 'Summoning a new gem will permanently replace your current one. Do you wish to proceed?',
  replaceCancel: 'Cancel',
  replaceConfirm: 'Summon New Gem',

  // Gem Detail Page
  gemNotFound: 'Gem Not Found',
  gemNotFoundMessage: 'This gem has vanished into the void...',
  sealedBy: 'Sealed by',
  born: 'Born',
  obtained: 'Obtained',
  origin: 'Origin',
  originGacha: 'Summoned',
  originExchange: 'Exchanged',
  originGift: 'Gifted',

  // Shared Gem Page
  invalidLink: 'Invalid Link',
  invalidLinkMessage: 'This gem link is invalid or corrupted.',
  sharedGem: 'Shared Gem',
  someoneGem: '\'s Gem',
  summonYourOwn: 'Summon Your Own Gem',
};

const translations: Record<SupportedLocale, Translations> = {
  ko,
  en,
  zh: en, // Fallback to English for now
  ja: en, // Fallback to English for now
  es: en, // Fallback to English for now
};

export function getTranslations(locale: SupportedLocale): Translations {
  return translations[locale] ?? translations.ko;
}

export default translations;
