import dayjs, { type Dayjs } from 'dayjs';
import classNames from 'classnames';
import styles from './daily-workload-module.scss';
import React from 'react';
import { navigate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { spaBasePath } from '../../constants';
import { isSameMonth } from '../../helpers';
import { CalendarType, DailyAppointmentsCountByService } from '../../types';

interface WeeklyCellProps {
  type: CalendarType;
  dateTime: Dayjs;
  currentDate: Dayjs;
  events: Array<DailyAppointmentsCountByService>;
}

const DailyWorkloadView: React.FC<WeeklyCellProps> = ({ type, dateTime, currentDate, events }) => {
  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD'),
  );

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
            {currentData?.services && (
              <div className={styles.currentData}>
                {currentData?.services.map(({ serviceName, count }) => (
                  <div
                    className={classNames(styles.serviceArea)}
                    key={serviceName}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate({ to: `${spaBasePath}/appointments/list/${dateTime}/${serviceName}` })}>
                    <span>{serviceName}</span>
                    <span>{count}</span>
                  </div>
                ))}
                <div
                  className={classNames(styles.serviceArea, styles.green)}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate({ to: `${spaBasePath}/appointments/list/${dateTime}/Total` })}>
                  <span>{t('total', 'Total')}</span>
                  <span>{currentData?.services.reduce((sum, currentValue) => sum + currentValue?.count ?? 0, 0)}</span>
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
