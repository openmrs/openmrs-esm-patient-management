import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { spaHomePage } from '../../constants';
import styles from './monthly-view-workload.scss';
import { type DailyAppointmentsCountByService } from '../../types';
import SelectedDateContext from '../../hooks/selectedDateContext';
import { User } from '@carbon/react/icons';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';

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
    [events],
  );

  const visibleServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return currentData.services;
      return currentData.services.slice(0, layout === 'small-desktop' ? 2 : 4);
    }
    return [];
  }, [currentData, showAllServices, layout, currentData]);

  const hasHiddenServices = useMemo(() => {
    if (currentData?.services) {
      if (showAllServices) return false;
      return layout === 'small-desktop' ? currentData.services.length > 2 : currentData.services.length > 4;
    }
    return false;
  }, [layout, currentData, currentData]);

  const navigateToAppointmentsByDate = (serviceUuid: string) => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs(dateTime).format('YYYY-MM-DD')}/${serviceUuid}` });
  };

  return (
    <div
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
        <p>
          <div className={classNames(styles.totals)} onClick={() => navigateToAppointmentsByDate('')}>
            {currentData?.services ? (
              <div role="button" tabIndex={0}>
                <User size={16} />
                <span>{currentData?.services.reduce((sum, { count = 0 }) => sum + count, 0)}</span>
              </div>
            ) : (
              <div />
            )}
            <b className={styles.calendarDate}>{dateTime.format('D')}</b>
          </div>
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
        </p>
      )}
    </div>
  );
};

export default MonthlyWorkloadView;
