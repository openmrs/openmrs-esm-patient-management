import React from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { spaBasePath } from '../../constants';
import styles from './monthly-view-workload.scss';
import { type CalendarType, type DailyAppointmentsCountByService } from '../../types';

interface MonthlyWorkloadViewProps {
  type: CalendarType;
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  currentDate: Dayjs;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ type, dateTime, currentDate, events }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
  );

  const serviceAreaOnClick = (serviceName) => {
    navigate({ to: `${spaBasePath}/appointments/list/${dateTime}/${serviceName}` });
  };
  if (!currentData) {
    return (
      <div
        className={classNames(styles[isSameMonth(dateTime, currentDate) ? 'monthly-cell' : 'monthly-cell-disabled'], {
          [styles.greyBackground]: currentData?.services,
          [styles.smallDesktopEmpty]: layout === 'small-desktop',
          [styles.largeDesktopEmpty]: layout !== 'small-desktop',
        })}>
        {type === 'monthly' && isSameMonth(dateTime, currentDate) && (
          <b className={styles.calendarDate}>{dateTime.format('D')}</b>
        )}
      </div>
    );
  } else {
    return (
      <div
        className={classNames(styles[isSameMonth(dateTime, currentDate) ? 'monthly-cell' : 'monthly-cell-disabled'], {
          [styles.greyBackground]: currentData?.services,
          [styles.smallDesktop]: layout === 'small-desktop',
          [styles.largeDesktop]: layout !== 'small-desktop',
        })}>
        {type === 'monthly' && isSameMonth(dateTime, currentDate) && (
          <p>
            <b className={styles.calendarDate}>{dateTime.format('D')}</b>
            {currentData?.services && (
              <div className={styles.currentData}>
                {currentData.services.map(({ serviceName, count }, i) => (
                  <div
                    key={`${serviceName}-${count}-${i}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => serviceAreaOnClick(serviceName)}
                    className={styles.serviceArea}>
                    <span>{serviceName}</span>
                    <span>{count}</span>
                  </div>
                ))}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => serviceAreaOnClick('Total')}
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
  }
};

export default MonthlyWorkloadView;
