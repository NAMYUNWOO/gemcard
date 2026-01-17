import { useMemo } from 'react';
import type { SupportedLocale, MagicPower, LocalizedDescriptions } from '../types/gem';
import { getLocalizedDescription, getLocalizedTitle, getLocalizedName } from '../types/gem';

const DEFAULT_LOCALE: SupportedLocale = 'ko';

/**
 * Detect browser locale and map to supported locale
 */
function detectLocale(): SupportedLocale {
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();

  const localeMap: Record<string, SupportedLocale> = {
    ko: 'ko',
    en: 'en',
    zh: 'zh',
    ja: 'ja',
    es: 'es',
  };

  return localeMap[langCode] ?? DEFAULT_LOCALE;
}

/**
 * Hook to get current locale
 */
export function useLocale(): SupportedLocale {
  return useMemo(() => detectLocale(), []);
}

/**
 * Hook to get localized description from MagicPower
 */
export function useLocalizedDescription(magicPower: MagicPower): string {
  const locale = useLocale();
  return useMemo(() => getLocalizedDescription(magicPower, locale), [magicPower, locale]);
}

/**
 * Hook to get localized title from MagicPower
 */
export function useLocalizedTitle(magicPower: MagicPower): string {
  const locale = useLocale();
  return useMemo(() => getLocalizedTitle(magicPower, locale), [magicPower, locale]);
}

/**
 * Hook to get localized gem name
 */
export function useLocalizedName(gem: { name: string; names?: LocalizedDescriptions }): string {
  const locale = useLocale();
  return useMemo(() => getLocalizedName(gem, locale), [gem, locale]);
}

/**
 * Get current locale (non-hook version for utility functions)
 */
export function getCurrentLocale(): SupportedLocale {
  return detectLocale();
}
