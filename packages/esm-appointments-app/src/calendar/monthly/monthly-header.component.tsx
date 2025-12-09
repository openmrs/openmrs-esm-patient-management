import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { getLocale, getDefaultCalendar } from '@openmrs/esm-utils';
import { parseDate, toCalendar, createCalendar, getLocalTimeZone } from '@internationalized/date';
import { useAppointmentsStore, setSelectedDate } from '../../store';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const MonthlyHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const date = toCalendar(parseDate(selectedDate.split('T')[0]), createCalendar(getDefaultCalendar(getLocale())));

  const todayShort = new Intl.DateTimeFormat(getLocale(), { weekday: 'short' })
    .format(date.toDate(getLocalTimeZone()))
    .toUpperCase();

  const daysInWeeks = DAYS_IN_WEEK.map((day) => ({
    label: t(day),
    isToday: day === todayShort,
  }));

  const handleSelectPrevMonth = useCallback(() => {
    setSelectedDate(date.subtract({ months: 1 }).toString());
  }, [date]);

  const handleSelectNextMonth = useCallback(() => {
    setSelectedDate(date.subtract({ months: 1 }).toString());
  }, [date]);

  return (
    <>
      <div className={styles.container}>
        <Button
          aria-label={t('previousMonth', 'Previous month')}
          kind="tertiary"
          onClick={handleSelectPrevMonth}
          size="sm">
          {t('prev', 'Prev')}
        </Button>
        <span>{formatDate(new Date(selectedDate), { day: false, time: false, noToday: true })}</span>
        <Button aria-label={t('nextMonth', 'Next month')} kind="tertiary" onClick={handleSelectNextMonth} size="sm">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.workLoadCard}>
        {daysInWeeks.map(({ label, isToday }) => (
          <DaysOfWeekCard key={label} dayOfWeek={label} isToday={isToday} />
        ))}
      </div>
    </>
  );
};

export default MonthlyHeader;
