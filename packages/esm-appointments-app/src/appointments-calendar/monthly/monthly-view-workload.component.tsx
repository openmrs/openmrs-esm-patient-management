import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { spaBasePath } from '../../constants';
import styles from './monthly-view-workload.scss';

const colorCoding = { HIV: 'red', 'Lab testing': 'purple', Refill: 'blue' };

const MonthlyWorkload = ({ type, dateTime, currentDate, events }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
  );

  const serviceAreaOnClick = (serviceName) => {
    navigate({ to: `${spaBasePath}/appointments/list/${dateTime}/${serviceName}` });
  };

  return (
    <div
      className={`${styles[isSameMonth(dateTime, currentDate) ? 'monthly-cell' : 'monthly-cell-disabled']} ${
        currentData?.service ? styles.greyBackground : ''
      } ${layout === 'small-desktop' ? styles.smallDesktop : styles.largeDesktop}`}>
      {type === 'monthly' && isSameMonth(dateTime, currentDate) && (
        <p>
          <b>{dateTime.format('D')}</b>
          {currentData?.service && (
            <div className={styles.currentData}>
              {currentData.service.map(({ serviceName, count }) => (
                <div
                  key={serviceName}
                  role="button"
                  tabIndex={0}
                  onClick={() => serviceAreaOnClick(serviceName)}
                  className={`${styles.serviceArea} ${styles[colorCoding[serviceName]]}`}>
                  <span>{serviceName}</span>
                  <span>{count}</span>
                </div>
              ))}
              <div
                role="button"
                tabIndex={0}
                onClick={() => serviceAreaOnClick('Total')}
                className={`${styles.serviceArea} ${styles.green}`}>
                <span>{t('total', 'Total')}</span>
                <span>{currentData?.service.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
              </div>
            </div>
          )}
        </p>
      )}
    </div>
  );
};

export default MonthlyWorkload;
