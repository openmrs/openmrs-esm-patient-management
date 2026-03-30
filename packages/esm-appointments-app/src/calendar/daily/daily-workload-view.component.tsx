import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from '../monthly/monthly-view-workload.scss';

interface DailyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
}

const DailyWorkloadView: React.FC<DailyWorkloadViewProps> = ({ dateTime, events }) => {
  /* Check if the rendered date is today for conditional styling */
  const isToday = dayjs(dateTime).isSame(dayjs(), 'day');

  /* Detect layout type to adjust UI responsiveness */
  const layout = useLayoutType();

  /* Create a date-indexed map for quick lookup of event data */
  const eventMap = useMemo(() => {
    const map = new Map<string, DailyAppointmentsCountByService>();
    events?.forEach((event) => {
      map.set(dayjs(event.appointmentDate).format('YYYY-MM-DD'), event);
    });
    return map;
  }, [events]);

  /* Retrieve event data for the currently selected date */
  const currentData = useMemo(() => {
    return eventMap.get(dayjs(dateTime).format('YYYY-MM-DD'));
  }, [eventMap, dateTime]);

  /* Navigate to appointments list filtered by date and optional service */
  const navigateToAppointmentsByDate = (serviceUuid: string) => {
    navigate({
      to: `${spaHomePage}/appointments/${dayjs(dateTime).format('YYYY-MM-DD')}/${serviceUuid}`,
    });
  };

  return (
    <div
      /* Default click navigates to all appointments for the selected date */
      onClick={() => navigateToAppointmentsByDate('')}
      className={classNames(styles['monthly-cell'], {
        [styles.todayCell]: isToday,
        [styles.largeDesktop]: layout !== 'small-desktop',
      })}>
      <div>
        <span className={styles.totals}>
          {/* Display total appointments count across all services */}
          {currentData?.services ? (
            <div>
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

        {/* Render per-service appointment counts with individual navigation */}
        {currentData?.services && (
          <div className={styles.currentData}>
            {currentData.services.map(({ serviceName, serviceUuid, count }) => (
              <div
                key={`${serviceUuid}-${dateTime.format('YYYY-MM-DD')}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  /* Prevent parent click and navigate to specific service view */
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

export default DailyWorkloadView;
