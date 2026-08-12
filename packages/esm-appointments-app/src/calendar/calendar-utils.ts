import { getLocale } from '@openmrs/esm-framework';
import { getDefaultCalendar } from '@openmrs/esm-utils';

export function getCalendarFormat(): { locale: string; calendar: string } {
  const locale = getLocale() || 'en';
  const calendar = getDefaultCalendar(locale) ?? 'gregory';
  return { locale, calendar };
}
