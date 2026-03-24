import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate, navigate } from '@openmrs/esm-framework';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';
import { spaHomePage } from '../../constants';
import { useSelectedDate } from '../../hooks/useSelectedDate';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const MonthlyHeader: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const calendarSelectedDate = dayjs(selectedDate);

  const handleSelectPrevMonth = useCallback(() => {
    navigate({
      to: `${spaHomePage}/appointments/calendar/${calendarSelectedDate.subtract(1, 'month').format('YYYY-MM-DD')}`,
    });
  }, [calendarSelectedDate]);

  const handleSelectNextMonth = useCallback(() => {
    navigate({
      to: `${spaHomePage}/appointments/calendar/${calendarSelectedDate.add(1, 'month').format('YYYY-MM-DD')}`,
    });
  }, [calendarSelectedDate]);

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
        {DAYS_IN_WEEK.map((day) => (
          <DaysOfWeekCard key={day} dayOfWeek={day} />
        ))}
      </div>
    </>
  );
};

export default MonthlyHeader;
