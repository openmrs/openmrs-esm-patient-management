import { Button } from '@carbon/react';
import { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './daily-header.scss';
import { CalendarType } from '../../types';

const Format = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
} as const;
const dateFormat = 'MMMM DD, YYYY';
const yearFormat = 'YYYY';
function DailyHeader({
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
        <h2>
          {type === 'daily'
            ? currentDate.format(dateFormat)
            : `${currentDate.startOf('week').format(dateFormat)} - ${currentDate
                .endOf('week')
                .format(dateFormat)} , ${currentDate.format(yearFormat)}`}
        </h2>
        <Button size="sm" onClick={() => setCurrentDate(currentDate.add(1, Format[type]))} kind="tertiary">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.dayDate}>
        <div className={styles.dayDateColumn1}></div>
        <div className={styles.dayDateColumn2}> {type === 'daily' ? currentDate.format('dddd') : ''}</div>
      </div>
    </>
  );
}
export default DailyHeader;
