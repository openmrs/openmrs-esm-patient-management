import React from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { omrsDateFormat, spaHomePage } from '../../constants';
import styles from './monthly-view-workload.scss';
import { type DailyAppointmentsCountByService } from '../../types';

interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  currentDate: Dayjs;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, currentDate, events }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
  );

  const onClick = (serviceUuid) => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(dateTime).format(omrsDateFormat)}/${serviceUuid}` });
  };

  return (
    <div
      onClick={(e) => {
        onClick('');
      }}
      className={classNames(styles[isSameMonth(dateTime, currentDate) ? 'monthly-cell' : 'monthly-cell-disabled'], {
        [styles.greyBackground]: currentData?.services,
        [styles.smallDesktop]: layout === 'small-desktop',
        [styles.largeDesktop]: layout !== 'small-desktop',
      })}>
      {isSameMonth(dateTime, currentDate) && (
        <p>
          <b className={styles.calendarDate}>{dateTime.format('D')}</b>
          {currentData?.services && (
            <div className={styles.currentData}>
              {currentData.services.map(({ serviceName, serviceUuid, count }, i) => (
                <div
                  key={`${serviceUuid}-${count}-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(serviceUuid);
                  }}
                  className={styles.serviceArea}>
                  <span>{serviceName}</span>
                  <span>{count}</span>
                </div>
              ))}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick('');
                }}
                className={classNames(styles.serviceArea, styles.green)}>
                <span>{t('total', 'Total')}</span>
                <span>{currentData?.services.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
              </div>
            </div>
          )}
        </p>
      )}
    </div>
  );
};

export default MonthlyWorkloadView;
