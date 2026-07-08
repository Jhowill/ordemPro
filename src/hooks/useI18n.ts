import { useMemo } from 'react';

import { createTranslator, getLocaleName, getStatusLabel, getLocaleIntl } from '@/i18n/translations';
import { useAppData } from '@/services/storage';
import type { AppLocale, ServiceOrderStatus } from '@/types';

export function useI18n() {
  const { data, saveLocale } = useAppData();
  const t = useMemo(() => createTranslator(data.locale), [data.locale]);

  return {
    locale: data.locale,
    localeIntl: getLocaleIntl(data.locale),
    t,
    saveLocale,
    localeName: (locale: AppLocale) => getLocaleName(locale, data.locale),
    statusLabel: (status: ServiceOrderStatus) => getStatusLabel(status, data.locale),
  };
}
