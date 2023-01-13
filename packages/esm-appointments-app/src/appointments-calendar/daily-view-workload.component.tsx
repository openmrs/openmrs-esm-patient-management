import dayjs, { Dayjs } from 'dayjs';
import styles from './daily-workload-module.scss';
import React from 'react';
import { CalendarType } from '../types';
import { dailyView, isSameMonth } from '../helpers';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface WeeklyCellProps {
  type: CalendarType;
  dateTime: Dayjs;
  currentDate: Dayjs;
  events: Array<any>;
}

const DailyWorkloadView: React.FC<WeeklyCellProps> = ({ type, dateTime, currentDate, events }) => {
  const layout = useLayoutType();
  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD'),
  );
  const colorCoding = { HIV: 'red', 'Lab testing': 'purple', Refill: 'blue' };
  const { t } = useTranslation();

  return (
    <div
      className={
        styles[
          type === 'daily'
            ? 'weekly-cell'
            : isSameMonth(dateTime, currentDate)
            ? 'monthly-cell'
            : 'monthly-cell-disabled'
        ]
      }>
      {type === 'daily' ? (
        <>
          <div className={styles.allDayComponent}>
            <small className={styles.allDay}>All Day</small>
            {currentData?.service && (
              <div className={styles.currentData}>
                {currentData?.service.map(({ serviceName, count, i }) => (
                  <div key={serviceName} className={`${styles.serviceArea} ${styles[colorCoding[serviceName]]}`}>
                    <span>{serviceName}</span>
                    <span>{count}</span>
                  </div>
                ))}
                <div className={`${styles.serviceArea} ${styles.green}`}>
                  <span>{t('total', 'Total')}</span>
                  <span>{currentData?.service.reduce((sum, currentValue) => sum + currentValue?.count ?? 0, 0)}</span>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
export default DailyWorkloadView;
