import { User } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useMemo } from 'react';
import { spaHomePage } from '../../constants';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from '../monthly/monthly-view-workload.scss';

interface WeeklyWorkloadCellProps {
  dateTime: Dayjs;
  events: Array<DailyAppointmentsCountByService>;
}

const WeeklyWorkloadCell: React.FC<WeeklyWorkloadCellProps> = ({ dateTime, events }) => {
  const layout = useLayoutType();

  const currentData = useMemo(
    () => events?.find((e) => dayjs(e.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD')),
    [dateTime, events],
  );

  const visibleServices = useMemo(() => {
    if (!currentData?.services) return [];
    return currentData.services.slice(0, layout === 'small-desktop' ? 2 : 4);
  }, [currentData, layout]);

  const hasHiddenServices = useMemo(() => {
    if (!currentData?.services) return false;
    return layout === 'small-desktop' ? currentData.services.length > 2 : currentData.services.length > 4;
  }, [currentData?.services, layout]);

  const isToday = dayjs(dateTime).isSame(dayjs(), 'day');

  const navigateToAppointmentsByDate = (serviceUuid: string) => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(dateTime).format('YYYY-MM-DD')}/${serviceUuid}` });
  };

  return (
    <div
      onClick={() => navigateToAppointmentsByDate('')}
      className={classNames(styles['monthly-cell'], styles.largeDesktop)}>
      <span className={styles.totals}>
        {currentData?.services ? (
          <div role="button" tabIndex={0}>
            <User size={16} />
            <span>{currentData.services.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
          </div>
        ) : (
          <div />
        )}
        <b className={classNames(styles.calendarDate, { [styles.todayDate]: isToday })}>{dateTime.format('D')}</b>
      </span>

      {currentData?.services && (
        <div className={styles.currentData}>
          {visibleServices.map(({ serviceName, serviceUuid, count }, i) => (
            <div
              key={`${serviceUuid}-${i}`}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                navigateToAppointmentsByDate(serviceUuid);
              }}
              className={styles.serviceArea}>
              <span>{serviceName}</span>
              <span>{count}</span>
            </div>
          ))}
          {hasHiddenServices && (
            <span className={styles.showMoreItems}>
              +{currentData.services.length - (layout === 'small-desktop' ? 2 : 4)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyWorkloadCell;
