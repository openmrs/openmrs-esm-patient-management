import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import styles from './monthly-header.module.scss';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { CalendarType } from '../../types';
import DaysOfWeekCard from '../daily/days-of-week.component';

const Format = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
} as const;

const monthFormat = 'MMMM, YYYY';
const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
function MonthlyHeader({
  type,
  currentDate,
  setCurrentDate,
}: {
  type: CalendarType;
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.container}>
        <Button size="sm" onClick={() => setCurrentDate(currentDate.subtract(1, Format[type]))} kind="tertiary">
          {t('prev', 'Prev')}
        </Button>
        <span>{currentDate.format(monthFormat)}</span>

        <Button size="sm" onClick={() => setCurrentDate(currentDate.add(1, Format[type]))} kind="tertiary">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.workLoadCard}>
        {daysInWeek?.map((day, i) => (
          <DaysOfWeekCard key={`${day}-${i}`} dayOfWeek={day} />
        ))}
      </div>
    </>
  );
}
export default MonthlyHeader;
