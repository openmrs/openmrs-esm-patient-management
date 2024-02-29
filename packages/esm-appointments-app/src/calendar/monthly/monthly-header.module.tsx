import React from 'react';
import dayjs from 'dayjs';
import styles from './monthly-header.module.scss';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import DaysOfWeekCard from './days-of-week.component';
import { changeSelectedDate, useSelectedDate } from '../../helpers';

const monthFormat = 'MMMM, YYYY';
const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
function MonthlyHeader() {
  const { t } = useTranslation();
  const { selectedDate } = useSelectedDate();

  return (
    <>
      <div className={styles.container}>
        <Button size="sm" onClick={() => changeSelectedDate(dayjs(selectedDate).subtract(1, 'month'))} kind="tertiary">
          {t('prev', 'Prev')}
        </Button>
        <span>{dayjs(selectedDate).format(monthFormat)}</span>

        <Button size="sm" onClick={() => changeSelectedDate(dayjs(selectedDate).add(1, 'month'))} kind="tertiary">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.workLoadCard}>
        {daysInWeek?.map((day, i) => <DaysOfWeekCard key={`${day}-${i}`} dayOfWeek={day} />)}
      </div>
    </>
  );
}
export default MonthlyHeader;
