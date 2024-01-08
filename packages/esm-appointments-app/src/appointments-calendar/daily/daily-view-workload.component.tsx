import dayjs, { type Dayjs } from 'dayjs';
import classNames from 'classnames';
import styles from './daily-workload-module.scss';
import React from 'react';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { spaBasePath } from '../../constants';
import { isSameMonth } from '../../helpers';
import { type CalendarType } from '../../types';

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
                  <div
                    className={classNames(styles.serviceArea, styles[colorCoding[serviceName]])}
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
