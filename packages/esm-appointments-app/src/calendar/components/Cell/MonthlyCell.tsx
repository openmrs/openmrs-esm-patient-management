import dayjs, { Dayjs } from 'dayjs';
import { isSameMonth } from '../../functions/monthly';
import styles from './MonthlyCell.module.scss';
import React from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { CalendarType } from '../../../types';

interface MonthlyCellProps {
  type: CalendarType;
  dateTime: Dayjs;
  currentDate: Dayjs;
  events: Array<any>;
}

const MonthlyCell: React.FC<MonthlyCellProps> = ({ type, dateTime, currentDate, events }) => {
  const layout = useLayoutType();
  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD'),
  );
  const colorCoding = { HIV: 'red', 'Lab testing': 'yellow', Refill: 'blue' };
  const { t } = useTranslation();

  return (
    <div
      className={`${styles[isSameMonth(dateTime, currentDate) ? 'monthly-cell' : 'monthly-cell-disabled']} ${
        currentData?.service ? styles.greyBackground : ''
      } ${layout === 'small-desktop' ? styles.smallDesktop : styles.largeDesktop}`}>
      {type === 'monthly' ? (
        <p>
          {isSameMonth(dateTime, currentDate) && (
            <>
              {!currentData?.service && dateTime.format('D')} {''}
              {currentData?.service && (
                <div className={styles.currentData}>
                  {currentData?.service.map(({ serviceName, count }) => (
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
            </>
          )}
        </p>
      ) : null}
    </div>
  );
};
export default MonthlyCell;
