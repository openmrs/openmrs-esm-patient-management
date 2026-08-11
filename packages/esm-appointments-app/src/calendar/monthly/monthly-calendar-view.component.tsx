import React, { useMemo } from 'react';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import { getServiceTheme } from '../utils/calendar-colors';
import MonthlyHeader from './monthly-header.component';
import MonthlyViewWorkload from './monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import workloadStyles from './monthly-view-workload.scss';

dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  calendarSelectedDate: Dayjs;
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, calendarSelectedDate, onSelectDate }) => {
  const { t } = useTranslation();

  const gridDays = useMemo(() => monthDays(calendarSelectedDate), [calendarSelectedDate]);

  const { eventsMap, servicesLegendList } = useMemo(() => {
    const eventsMap = new Map<string, DailyAppointmentsCountByService>();
    const legendMap = new Map<string, { serviceName: string; serviceUuid?: string }>();

    events?.forEach((event) => {
      if (event.appointmentDate) {
        eventsMap.set(dayjs(event.appointmentDate).format('YYYY-MM-DD'), event);
      }
      event.services?.forEach((service) => {
        const key = service.serviceUuid || service.serviceName;
        if (service.serviceName && key && !legendMap.has(key)) {
          legendMap.set(key, { serviceName: service.serviceName, serviceUuid: service.serviceUuid });
        }
      });
    });

    return {
      eventsMap,
      servicesLegendList: Array.from(legendMap.values()),
    };
  }, [events]);

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {gridDays.map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              index={i}
              dateTime={dateTime}
              events={events}
              eventsMap={eventsMap}
              calendarSelectedDate={calendarSelectedDate}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      </div>
      <div className={workloadStyles.servicesLegend}>
        {servicesLegendList.length > 0 && (
          <>
            <span className={workloadStyles.legendTitle}>{t('services', 'Services')}</span>
            <div className={workloadStyles.legendItems}>
              {servicesLegendList.map(({ serviceName, serviceUuid }) => {
                const theme = getServiceTheme(serviceUuid, serviceName);
                return (
                  <div key={serviceUuid || serviceName} className={workloadStyles.legendItem}>
                    <span className={workloadStyles.swatch} style={{ backgroundColor: theme.swatch }} />
                    <span>{serviceName}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
