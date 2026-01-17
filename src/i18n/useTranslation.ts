import { useMemo } from 'react';
import { useLocale } from '../hooks/useLocale';
import { getTranslations, type Translations } from './translations';

export function useTranslation(): Translations {
  const locale = useLocale();
  return useMemo(() => getTranslations(locale), [locale]);
}
