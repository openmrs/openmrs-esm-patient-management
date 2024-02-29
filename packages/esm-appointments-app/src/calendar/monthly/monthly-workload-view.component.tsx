import React from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth, useSelectedDate } from '../../helpers';
import { omrsDateFormat, spaHomePage } from '../../constants';
import styles from './monthly-view-workload.scss';
import { type DailyAppointmentsCountByService } from '../../types';

interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { selectedDate } = useSelectedDate();

  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
  );

  const onClick = (serviceUuid) => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(dateTime).format(omrsDateFormat)}/${serviceUuid}` });
  };

  return (
    <div
      onClick={() => {
        onClick('');
      }}
      className={classNames(
        styles[isSameMonth(dateTime, dayjs(selectedDate)) ? 'monthly-cell' : 'monthly-cell-disabled'],
        {
          [styles.greyBackground]: currentData?.services,
          [styles.smallDesktop]: layout === 'small-desktop',
          [styles.largeDesktop]: layout !== 'small-desktop',
        },
      )}>
      {isSameMonth(dateTime, dayjs(selectedDate)) && (
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
