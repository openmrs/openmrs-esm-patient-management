import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { Popover, PopoverContent } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from './monthly-view-workload.scss';

export interface MonthlyWorkloadViewProps {
  events: Array<DailyAppointmentsCountByService>;
  eventsMap?: Map<string, DailyAppointmentsCountByService>;
  dateTime: Dayjs;
  calendarSelectedDate: Dayjs;
  showAllServices?: boolean;
  onSelectDate?: (isoDate: string) => void;
  index?: number;
  serviceColorMap?: Map<string, string>;
}

const MonthlyWorkloadView: React.FC<MonthlyWorkloadViewProps> = ({
  dateTime,
  events,
  eventsMap,
  calendarSelectedDate,
  showAllServices = false,
  onSelectDate,
  index,
  serviceColorMap,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const cellRef = useRef<HTMLDivElement | null>(null);

  const isToday = useMemo(() => dateTime.isSame(dayjs(), 'day'), [dateTime]);
  const isCurrentMonth = useMemo(() => isSameMonth(dateTime, calendarSelectedDate), [dateTime, calendarSelectedDate]);

  const popoverAlign = useMemo(() => {
    const isBelowFirstRow = index !== undefined ? index >= 7 : dateTime.date() > 7;
    const isRightSide = index !== undefined ? index % 7 >= 4 : false;
    if (isBelowFirstRow) {
      return isRightSide ? 'top-right' : 'top-left';
    }
    return isRightSide ? 'bottom-right' : 'bottom-left';
  }, [index, dateTime]);

  const dateFormatted = useMemo(
    () => ({
      dayNumber: dateTime.format('D'),
      popoverDate: dateTime.format('ddd, MMM D'),
      isoDate: dateTime.format('YYYY-MM-DD'),
    }),
    [dateTime],
  );

  const currentData = useMemo(() => {
    if (eventsMap) {
      return eventsMap.get(dateFormatted.isoDate);
    }
    return events?.find((event) => dayjs(event.appointmentDate)?.format('YYYY-MM-DD') === dateFormatted.isoDate);
  }, [events, eventsMap, dateFormatted.isoDate]);

  const totalCount = currentData?.services?.reduce((sum, { count = 0 }) => sum + count, 0) ?? 0;

  const maxVisible = layout === 'small-desktop' ? 2 : 3;

  const visibleServices = useMemo(() => {
    if (!currentData?.services) return [];
    return showAllServices ? currentData.services : currentData.services.slice(0, maxVisible);
  }, [currentData, showAllServices, maxVisible]);

  const hasHidden = useMemo(() => {
    if (!currentData?.services || showAllServices) return false;
    return currentData.services.length > maxVisible;
  }, [currentData?.services, showAllServices, maxVisible]);

  const handleCellClick = () => {
    if (totalCount === 0) return;
    setIsPopoverOpen((prev) => !prev);
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
      setIsPopoverOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen, handleClickOutside]);

  return (
    <Popover open={isPopoverOpen} align={popoverAlign} ref={cellRef}>
      <div
        onClick={handleCellClick}
        className={classNames(
          styles[isCurrentMonth ? 'monthly-cell' : 'monthly-cell-disabled'],
          {
            [styles['monthly-cell-today']]: isToday,
            [styles['monthly-cell-clickable']]: totalCount > 0,
            [styles.popoverOpen]: isPopoverOpen,
          },
          !showAllServices && {
            [styles.smallDesktop]: layout === 'small-desktop',
            [styles.largeDesktop]: layout !== 'small-desktop',
          },
        )}>
        <div className={styles.cellHeader}>
          {isToday ? (
            <span className={styles.todayCircle}>{dateFormatted.dayNumber}</span>
          ) : (
            <span className={isCurrentMonth ? styles.dateNumber : styles.dateNumberOtherMonth}>
              {dateFormatted.dayNumber}
            </span>
          )}
          {totalCount > 0 && (
            <span className={styles.totalBadge}>
              {totalCount} {totalCount === 1 ? t('appt', 'appt') : t('appts', 'appts')}
            </span>
          )}
        </div>

        {currentData?.services && currentData.services.length > 0 && (
          <div className={styles.currentData}>
            {visibleServices.map(({ serviceName, serviceUuid, count }, i) => {
              const color = serviceColorMap?.get(serviceUuid ?? '');
              return (
                <div key={`${serviceUuid}-${i}`} className={styles.serviceArea} style={{ backgroundColor: `${color}21` }}>
                  <span className={styles.swatch} style={{ backgroundColor: color }} />
                  <span className={styles.serviceName}>{serviceName}</span>
                  <span className={styles.serviceCount}>{count}</span>
                </div>
              );
            })}
            {hasHidden && (
              <button
                className={styles.showMoreItems}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopoverOpen(true);
                }}>
                +{currentData.services.length - maxVisible} {t('more', 'more')}
              </button>
            )}
          </div>
        )}
      </div>

      <PopoverContent>
        <div className={styles.popoverCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.popoverHeader}>
            <div className={styles.popoverTitleGroup}>
              <span className={styles.popoverDate}>{dateFormatted.popoverDate}</span>
              <span className={styles.popoverSubtitle}>
                {t('appointmentCount', '{{count}} appointment(s)', { count: totalCount })}
              </span>
            </div>
            <button
              className={styles.popoverCloseBtn}
              onClick={() => setIsPopoverOpen(false)}
              aria-label={t('close', 'Close')}>
              <Close size={16} />
            </button>
          </div>
          <div className={styles.popoverDivider} />
          <div className={styles.popoverServiceList}>
            {currentData?.services?.map(({ serviceName, serviceUuid, count }, i) => {
              const color = serviceColorMap?.get(serviceUuid ?? '');
              return (
                <div key={`${serviceUuid}-${i}`} className={styles.popoverServiceRow}>
                  <span className={styles.swatch} style={{ backgroundColor: color }} />
                  <span className={styles.popoverServiceName}>{serviceName}</span>
                  <span className={styles.popoverServiceCount}>{count}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.popoverDivider} />
          <button
            className={styles.openDayViewLink}
            onClick={() => {
              setIsPopoverOpen(false);
              onSelectDate?.(dateFormatted.isoDate);
            }}>
            {t('openDayView', 'Open day view')} &rarr;
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(MonthlyWorkloadView);
