import React, { useMemo } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { User } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import MonthlyWorkloadViewExpanded from './monthly-workload-view-expanded.component';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
  /**
   * The ISO date (YYYY-MM-DD) of the month being navigated.
   * Used to determine which cells are in the current month vs overflow days.
   * Passed from the orchestrator so calendar-system switching works correctly.
   */
  navIsoDate?: string;
  /**
   * Called when the user clicks a day cell that has appointments.
   * Receives the ISO date (YYYY-MM-DD).
   * When provided, opens the modal instead of navigating away.
   */
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({
  dateTime,
  events,
  showAllServices = false,
  navIsoDate,
  onSelectDate,
}) => {
  const layout = useLayoutType();
  // Fall back to today if navIsoDate is not provided (backwards-compatible)
  const referenceDate = navIsoDate ? dayjs(navIsoDate) : dayjs();

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

  const handleDateClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentData?.services?.length) return;
    const isoDate = dayjs(dateTime).format('YYYY-MM-DD');
    if (onSelectDate) {
      onSelectDate(isoDate);
    }
  };

  return (
    <div
      onClick={handleDateClick}
      className={classNames(
        styles[isSameMonth(dateTime, referenceDate) ? 'monthly-cell' : 'monthly-cell-disabled'],
        showAllServices
          ? {}
          : {
              [styles.smallDesktop]: layout === 'small-desktop',
              [styles.largeDesktop]: layout !== 'small-desktop',
            },
      )}>
      {isSameMonth(dateTime, referenceDate) && (
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
                    handleDateClick(e);
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
                  navIsoDate={navIsoDate}
                  onSelectDate={onSelectDate}
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
