import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate, navigate } from '@openmrs/esm-framework';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import { spaHomePage } from '../../constants';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const MonthlyHeader: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();

  const handleSelectPrevMonth = () => {
    navigate({
      to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).subtract(1, 'month').format('YYYY-MM-DD')}`,
    });
  };

  const handleSelectNextMonth = () => {
    navigate({
      to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).add(1, 'month').format('YYYY-MM-DD')}`,
    });
  };

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
