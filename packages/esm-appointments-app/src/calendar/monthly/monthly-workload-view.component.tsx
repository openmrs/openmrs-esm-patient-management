import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import SelectedDateContext from '../../hooks/selectedDateContext';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events, showAllServices = false }) => {
  const layout = useLayoutType();
  const { selectedDate } = useContext(SelectedDateContext);

  const currentData = useMemo(
    () =>
      events?.find(
        (event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dayjs(dateTime)?.format('YYYY-MM-DD'),
      ),
    [dateTime, events],
  );

  const visibleServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return currentData.services;
      return currentData.services.slice(0, layout === 'small-desktop' ? 2 : 4);
    }
    return [];
  }, [currentData, showAllServices, layout]);

  const hasHiddenServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return false;
      return layout === 'small-desktop' ? currentData.services.length > 2 : currentData.services.length > 4;
    }
    return false;
  }, [currentData?.services, layout, showAllServices]);

  const navigateToAppointmentsByDate = (serviceUuid: string) => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(dateTime).format('YYYY-MM-DD')}/${serviceUuid}` });
  };

  return (
    <div
      onClick={() => navigateToAppointmentsByDate('')}
      className={classNames(
        styles[isSameMonth(dateTime, dayjs(selectedDate)) ? 'monthly-cell' : 'monthly-cell-disabled'],
        showAllServices
          ? {}
          : {
              [styles.smallDesktop]: layout === 'small-desktop',
              [styles.largeDesktop]: layout !== 'small-desktop',
            },
      )}>
      {isSameMonth(dateTime, dayjs(selectedDate)) && (
        <div>
          <span className={classNames(styles.totals)}>
            {currentData?.services ? (
              <div role="button" tabIndex={0}>
                <User size={16} />
                <span>{currentData?.services.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
              </div>
            ) : (
              <div />
            )}
            <b className={styles.calendarDate}>{dateTime.format('D')}</b>
          </span>
          {currentData?.services && (
            <div className={styles.currentData}>
              {visibleServices.map(({ serviceName, serviceUuid, count }, i) => (
                <div
                  key={`${serviceUuid}-${count}-${i}`}
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
              {hasHiddenServices ? (
                <MonthlyWorkloadViewExpanded
                  count={currentData.services.length - (layout === 'small-desktop' ? 2 : 4)}
                  events={events}
                  dateTime={dateTime}
                />
              ) : (
                ''
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyWorkloadView;
