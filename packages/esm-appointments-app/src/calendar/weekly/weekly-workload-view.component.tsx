import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from '../monthly/monthly-view-workload.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';

export interface WeeklyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
}

const WeeklyWorkloadView: React.FC<WeeklyWorkloadViewProps> = ({ dateTime, events }) => {
  /* Detect layout size for responsive rendering */
  const layout = useLayoutType();

  /* Check if this cell represents today's date */
  const isToday = dayjs(dateTime).isSame(dayjs(), 'day');

  /* Get selected date to determine current month context */
  const selectedDate = useSelectedDate();

  /* Check if this date belongs to the selected month */
  const isCurrentMonth = dayjs(dateTime).isSame(dayjs(selectedDate), 'month');

  /* Build a date-indexed map for efficient event lookup */
  const eventMap = useMemo(() => {
    const map = new Map<string, DailyAppointmentsCountByService>();
    events?.forEach((event) => {
      map.set(dayjs(event.appointmentDate).format('YYYY-MM-DD'), event);
    });
    return map;
  }, [events]);

  /* Retrieve data for the current date cell */
  const currentData = eventMap.get(dayjs(dateTime).format('YYYY-MM-DD'));

  /* Limit visible services based on layout constraints */
  const visibleServices = useMemo(() => {
    if (!currentData?.services) return [];

    const limit = layout === 'small-desktop' ? 2 : 4;
    return currentData.services.slice(0, limit);
  }, [currentData, layout]);

  /* Navigate to appointments filtered by date and optional service */
  const navigateToAppointmentsByDate = (serviceUuid: string) => {
    navigate({
      to: `${spaHomePage}/appointments/${dayjs(dateTime).format('YYYY-MM-DD')}/${serviceUuid}`,
    });
  };

  return (
    <div
      /* Default click navigates to all appointments for this date */
      onClick={() => navigateToAppointmentsByDate('')}
      className={classNames(styles['monthly-cell'], {
        [styles.todayCell]: isToday,
        [styles.smallDesktop]: layout === 'small-desktop',
        [styles.largeDesktop]: layout !== 'small-desktop',
        [styles.disabledCell]: !isCurrentMonth && !isToday,
      })}>
      <div>
        <span className={styles.totals}>
          {/* Display total appointment count across all services */}
          {currentData?.services ? (
            <div role="button" tabIndex={0}>
              <User size={16} />
              <span>{currentData.services.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
            </div>
          ) : (
            <div />
          )}

          <b
            className={classNames(styles.calendarDate, {
              [styles.todayText]: isToday,
            })}>
            {dateTime.format('D')}
          </b>
        </span>

        {/* Render visible services for the selected day */}
        {currentData?.services && (
          <div className={styles.currentData}>
            {visibleServices.map(({ serviceName, serviceUuid, count }) => (
              <div
                key={`${serviceUuid}-${dateTime.format('YYYY-MM-DD')}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  /* Prevent parent click and navigate to specific service */
                  e.stopPropagation();
                  navigateToAppointmentsByDate(serviceUuid);
                }}
                className={styles.serviceArea}>
                <span>{serviceName}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyWorkloadView;
