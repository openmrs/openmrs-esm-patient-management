import React, { useContext, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { Popover, PopoverContent } from '@carbon/react';
import { User } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import { type DailyAppointmentsCountByService } from '../../types';
import { isSameMonth } from '../../helpers';
import { spaHomePage } from '../../constants';
import SelectedDateContext from '../../hooks/selectedDateContext';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  showAllServices?: boolean;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({ dateTime, events, showAllServices = false }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedDate } = useContext(SelectedDateContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = useRef(null);

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

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
        <p>
          <div className={classNames(styles.totals)}>
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
                <Popover open={isOpen} align="top" ref={popoverRef}>
                  <button className={styles.showMoreItems} onClick={() => setIsOpen((prev) => !prev)}>
                    {t('countMore', '{{count}} more', {
                      count: currentData.services.length - (layout === 'small-desktop' ? 2 : 4),
                    })}
                  </button>
                  <PopoverContent>
                    <MonthlyWorkloadView events={events} dateTime={dateTime} showAllServices={true} />
                  </PopoverContent>
                </Popover>
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
