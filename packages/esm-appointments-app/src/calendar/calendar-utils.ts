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

export function deriveCalKey(): string {
  const locale = getLocale();
  const lang = locale?.split('-')[0] ?? 'en';
  return REVERSE_LOCALE_MAP[lang] ?? 'gregory';
}
