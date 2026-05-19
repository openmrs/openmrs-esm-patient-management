import React from 'react';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface MonthlyHeaderProps {
  calendarSelectedDate: Dayjs;
  onSelectPrevMonth: () => void;
  onSelectNextMonth: () => void;
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({
  calendarSelectedDate,
  onSelectPrevMonth,
  onSelectNextMonth,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.container}>
        <Button aria-label={t('previousMonth', 'Previous month')} kind="tertiary" onClick={onSelectPrevMonth} size="sm">
          {t('prev', 'Prev')}
        </Button>
        <span>{formatDate(calendarSelectedDate.toDate(), { day: false, time: false, noToday: true })}</span>
        <Button aria-label={t('nextMonth', 'Next month')} kind="tertiary" onClick={onSelectNextMonth} size="sm">
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
