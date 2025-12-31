import LZString from 'lz-string';
import type { GemCard } from '../types/card';

export function serializeCard(card: GemCard): string {
  try {
    const json = JSON.stringify(card);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return compressed;
  } catch (e) {
    console.error('Failed to serialize card:', e);
    return '';
  }
}

export function deserializeCard(data: string): GemCard | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(data);
    if (!json) return null;
    const card = JSON.parse(json) as GemCard;
    if (!card.id || !card.gem || !card.message) return null;
    return card;
  } catch (e) {
    console.error('Failed to deserialize card:', e);
    return null;
  }
}

export function buildShareUrl(card: GemCard): string {
  const data = serializeCard(card);
  if (!data) return '';

  const baseUrl = window.location.origin;
  return `${baseUrl}/receive/${encodeURIComponent(data)}`;
}

export async function shareCard(card: GemCard): Promise<boolean> {
  const url = buildShareUrl(card);
  if (!url) return false;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'GemCard',
        text: card.message.senderName
          ? `${card.message.senderName}님이 보낸 보석 카드`
          : '특별한 보석 카드가 도착했어요!',
        url,
      });
      return true;
    } catch {
      // User cancelled or share failed
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
