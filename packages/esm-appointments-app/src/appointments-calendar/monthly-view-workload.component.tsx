import { navigate, useLayoutType } from '@openmrs/esm-framework';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isSameMonth } from '../helpers';
import { CalendarType } from '../types';
import styles from './monthly-view-workload.scss';
interface MonthlyCellProps {
  type: CalendarType;
  dateTime: Dayjs;
  currentDate: Dayjs;
  events: Array<any>;
}

const MonthlyWorkload: React.FC<MonthlyCellProps> = ({ type, dateTime, currentDate, events }) => {
  const layout = useLayoutType();
  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD'),
  );
  const colorCoding = { HIV: 'red', 'Lab testing': 'purple', Refill: 'blue' };
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
              <b>{dateTime.format('D')}</b>
              {currentData?.service && (
                <div className={styles.currentData}>
                  {currentData?.service.map(({ serviceName, count }) => (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate({ to: `${window.spaBase}/patient-list/${dateTime}/${serviceName}` })}
                      key={serviceName}
                      className={`${styles.serviceArea} ${styles[colorCoding[serviceName]]}`}>
                      <span>{serviceName}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate({ to: `${window.spaBase}/patient-list/${dateTime}/Total` })}
                    className={`${styles.serviceArea} ${styles.green}`}>
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
export default MonthlyWorkload;
