export type GemShape = 'brilliant' | 'emerald' | 'princess' | 'pear' | 'oval' | 'sphere';

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

export const DEFAULT_GEM_PARAMS: Omit<GemParams, 'id'> = {
  shape: 'brilliant',
  color: '#ffffff',
  turbidity: 0,
  detailLevel: 0,
  dispersion: 0.05,
  thickness: 1.5,
};

export const SHAPE_OPTIONS: { value: GemShape; label: string; emoji: string }[] = [
  { value: 'brilliant', label: '라운드', emoji: '💎' },
  { value: 'emerald', label: '에메랄드', emoji: '💚' },
  { value: 'princess', label: '프린세스', emoji: '👑' },
  { value: 'pear', label: '물방울', emoji: '💧' },
  { value: 'oval', label: '타원', emoji: '🔮' },
  { value: 'sphere', label: '구체', emoji: '🔵' },
];

export const COLOR_OPTIONS = [
  '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe',
  '#fd79a8', '#00b894',
];
