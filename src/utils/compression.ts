import {
  unishox2_compress_simple,
  unishox2_decompress_simple,
} from 'unishox2.siara.cc';
import type { GemCard } from '../types/card';

/**
 * Convert Uint8Array to URL-safe Base64 string
 */
function uint8ArrayToUrlSafeBase64(bytes: Uint8Array, length: number): string {
  let binary = '';
  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert URL-safe Base64 string to Uint8Array
 */
function urlSafeBase64ToUint8Array(base64: string): Uint8Array {
  let standardBase64 = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  while (standardBase64.length % 4) {
    standardBase64 += '=';
  }

  const binary = atob(standardBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function serializeCard(card: GemCard): string {
  try {
    const json = JSON.stringify(card);
    const outBuf = new Uint8Array(json.length * 2);
    const compressedLen = unishox2_compress_simple(json, json.length, outBuf);
    return uint8ArrayToUrlSafeBase64(outBuf, compressedLen);
  } catch (e) {
    console.error('Failed to serialize card:', e);
    return '';
  }
}

export function deserializeCard(data: string): GemCard | null {
  try {
    const compressedBytes = urlSafeBase64ToUint8Array(data);
    const json = unishox2_decompress_simple(compressedBytes, compressedBytes.length);
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
