import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

interface MonthlyHeaderProps {
  /**
   * Optional ISO date to display. When not provided, falls back to the
   * URL param via useSelectedDate (legacy behaviour for standalone usage).
   */
  navIsoDate?: string;
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({ navIsoDate }) => {
  const { t } = useTranslation();
  const urlDate = useSelectedDate();
  const baseDate = navIsoDate ?? urlDate;

  const [calendarSelectedDate, setCalendarSelectedDate] = useState(dayjs(baseDate));

  const handleSelectPrevMonth = useCallback(() => {
    setCalendarSelectedDate(calendarSelectedDate.subtract(1, 'month'));
  }, [calendarSelectedDate, setCalendarSelectedDate]);

  const handleSelectNextMonth = useCallback(() => {
    setCalendarSelectedDate(calendarSelectedDate.add(1, 'month'));
  }, [calendarSelectedDate, setCalendarSelectedDate]);

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
        <span>{formatDate(new Date(baseDate), { day: false, time: false, noToday: true })}</span>
        <Button aria-label={t('nextMonth', 'Next month')} kind="tertiary" onClick={handleSelectNextMonth} size="sm">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.workLoadCard}>
        {DAYS_IN_WEEK.map((day) => (
          <DaysOfWeekCard key={day} dayOfWeek={day} />
        ))}
      </div>
    </>
  );
};

export default MonthlyHeader;
