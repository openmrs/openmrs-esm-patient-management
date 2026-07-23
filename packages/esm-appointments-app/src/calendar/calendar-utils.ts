import { getLocale } from '@openmrs/esm-framework';

export const LOCALE_MAP: Record<string, string> = {
  gregory: 'en-US',
  ethiopic: 'am-ET',
  islamic: 'ar-SA',
  persian: 'fa-IR',
};

export const REVERSE_LOCALE_MAP: Record<string, string> = {
  en: 'gregory',
  am: 'ethiopic',
  ar: 'islamic',
  fa: 'persian',
};

export const CALENDAR_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'gregory', label: 'Gregorian' },
  { key: 'ethiopic', label: 'Ethiopic' },
  { key: 'islamic', label: 'Islamic (Civil)' },
  { key: 'persian', label: 'Persian (Solar Hijri)' },
];

export function deriveCalKey(): string {
  const locale = getLocale();
  const lang = locale?.split('-')[0] ?? 'en';
  return REVERSE_LOCALE_MAP[lang] ?? 'gregory';
}
