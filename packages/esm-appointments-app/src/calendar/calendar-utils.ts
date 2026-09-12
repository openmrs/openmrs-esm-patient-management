import { getLocale } from '@openmrs/esm-framework';
import { resolveCalendarId } from '../hooks/useCalendarFormat';

export function getCalendarFormat(): { locale: string; calendar: string } {
  const locale = getLocale() || 'en';
  const calendar = resolveCalendarId(locale);
  return { locale, calendar };
}
export { useCalendarFormat } from '../hooks/useCalendarFormat';
export {
  buildMonthGrid,
  isSameLocalMonth,
  formatLocalDayNumber,
  formatLocalPopoverDate,
  formatLocalHourLabel,
  formatLocalTime,
  addLocalMonth,
  toLocalCalendarDate,
  toISODate,
  parseGregorianDate,
} from './utils/intl-calendar';
