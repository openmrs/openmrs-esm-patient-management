import { useState, useEffect, useMemo } from 'react';
import { getLocale } from '@openmrs/esm-framework';
import { getDefaultCalendar } from '@openmrs/esm-utils';
import { createCalendar, type Calendar } from '@internationalized/date';
import i18n from 'i18next';

export interface CalendarFormat {
  locale: string;
  calendarId: string;
  calendar: Calendar;
}

/**
 * Maps user locales to their regional calendar systems.
 * Browsers default `Intl` to "gregory" even for locales like `am-ET` (Ethiopia)
 * or `fa-IR` (Iran). This map ensures switching locale actually switches to the
 * region's local calendar system (e.g. 13-month Ethiopian, Solar Hijri Persian).
 */
const LOCALE_CALENDAR_MAP: Record<string, string> = {
  am: 'ethiopic',
  'am-et': 'ethiopic',
  ti: 'ethiopic',
  'ti-et': 'ethiopic',
  fa: 'persian',
  'fa-ir': 'persian',
  th: 'buddhist',
  'th-th': 'buddhist',
  ar: 'gregory',
  he: 'gregory',
};

export function resolveCalendarId(locale: string): string {
  const registered = getDefaultCalendar(locale);
  if (registered && registered !== 'gregory') {
    return registered;
  }
  const normalizedLocale = locale.toLowerCase();
  if (LOCALE_CALENDAR_MAP[normalizedLocale]) {
    return LOCALE_CALENDAR_MAP[normalizedLocale];
  }
  const baseLanguage = normalizedLocale.split(/[-_]/)[0];
  if (LOCALE_CALENDAR_MAP[baseLanguage]) {
    return LOCALE_CALENDAR_MAP[baseLanguage];
  }
  return registered ?? 'gregory';
}

export function useCalendarFormat(): CalendarFormat {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return (
      (typeof window !== 'undefined' ? window.i18next?.language : undefined) || i18n.language || getLocale() || 'en'
    );
  });

  useEffect(() => {
    const handleLanguageChanged = (lang: string) => {
      setCurrentLang(lang);
    };

    const i18nInstance = (typeof window !== 'undefined' && window.i18next) || i18n;
    if (i18nInstance?.on) {
      i18nInstance.on('languageChanged', handleLanguageChanged);
      return () => {
        i18nInstance.off('languageChanged', handleLanguageChanged);
      };
    }
  }, []);

  return useMemo(() => {
    const locale = getLocale() || currentLang || 'en';
    const calendarId = resolveCalendarId(locale);
    let calendar: Calendar;
    try {
      calendar = createCalendar(calendarId as Parameters<typeof createCalendar>[0]);
    } catch {
      calendar = createCalendar('gregory');
    }

    return { locale, calendarId, calendar };
  }, [currentLang]);
}
