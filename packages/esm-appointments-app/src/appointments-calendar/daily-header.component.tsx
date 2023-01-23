import { types } from '@babel/core';
import { Button } from '@carbon/react';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { weekDays } from '../helpers';
import { CalendarType } from '../types';
import styles from './daily-header.scss';

enum Format {
  daily = 'day',
}
const dateFormat = 'MMMM DD, YYYY';

interface DailyHeaderProps {
  type: 'daily';
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
}

const DailyHeader: React.FC<DailyHeaderProps> = ({ type, currentDate, setCurrentDate, events }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.container}>
        <Button size="sm" onClick={() => setCurrentDate(currentDate.subtract(1, Format.daily))} kind="tertiary">
          {t('prev', 'Prev')}end
        </Button>
        <h2>{currentDate.format(dateFormat)}</h2>
        <Button size="sm" onClick={() => setCurrentDate(currentDate.add(1, Format.daily))} kind="tertiary">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.dayDate}>
        <div className={styles.dayDateColumn1}></div>
        <div className={styles.dayDateColumn2}>{currentDate.format('dddd')}</div>
      </div>
    </>
  );
};
export default DailyHeader;
