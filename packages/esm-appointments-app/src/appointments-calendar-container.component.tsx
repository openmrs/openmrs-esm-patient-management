import React, { useState, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useAppointmentsCalendar } from './hooks/useAppointmentsCalendar';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useServiceFilter } from './filter/use-service-filter';
import ServiceFilter from './filter/service-filter.component';
import CalendarPageHeader from './calendar/header/calendar-page-header.component';
import CalendarView from './calendar/calendar-view.component';
import { buildServiceColorMap } from './calendar/utils/calendar-colors';
import { type CalendarViewMode, type LegendService } from './types';
import styles from './calendar/appointments-calendar-view-view.scss';

const AppointmentsCalendarContainer: React.FC = () => {
  const selectedDate = useSelectedDate();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));

  const { selectedServiceUuids, serviceTypes, onServiceChange } = useServiceFilter();
  const serviceColorMap = useMemo(() => buildServiceColorMap(serviceTypes), [serviceTypes]);

  const { calendarEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), viewMode, {
    selectedServiceUuids,
  });

  const appointmentCount = useMemo(
    () =>
      (calendarEvents ?? []).reduce(
        (totalCount, event) =>
          totalCount + (event.services ?? []).reduce((serviceCount, service) => serviceCount + (service.count ?? 0), 0),
        0,
      ),
    [calendarEvents],
  );

  const legendServices = useMemo<LegendService[]>(() => {
    const legendMap = new Map<string, LegendService>();
    (calendarEvents ?? []).forEach((event) => {
      event.services?.forEach((service) => {
        const key = service.serviceUuid || service.serviceName;
        if (service.serviceName && key && !legendMap.has(key)) {
          legendMap.set(key, { name: service.serviceName, uuid: service.serviceUuid ?? key });
        }
      });
    });
    return Array.from(legendMap.values());
  }, [calendarEvents]);

  const handlePrev = useCallback(() => {
    setCalendarSelectedDate((d) => (viewMode === 'monthly' ? d.subtract(1, 'month') : d.subtract(1, 'day')));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCalendarSelectedDate((d) => (viewMode === 'monthly' ? d.add(1, 'month') : d.add(1, 'day')));
  }, [viewMode]);

  const handleToday = useCallback(() => setCalendarSelectedDate(dayjs()), []);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => setViewMode(mode), []);

  const handleSelectDate = useCallback((isoDate: string) => {
    setCalendarSelectedDate(dayjs(isoDate));
    setViewMode('daily');
  }, []);

  return (
    <div data-testid="appointments-calendar" className={styles.backgroundColor}>
      <CalendarPageHeader
        filterElement={
          <ServiceFilter
            services={serviceTypes}
            serviceColorMap={serviceColorMap}
            selectedServiceUuids={selectedServiceUuids}
            onServiceChange={onServiceChange}
          />
        }
      />
      <CalendarView
        viewMode={viewMode}
        calendarSelectedDate={calendarSelectedDate}
        events={calendarEvents ?? []}
        appointmentCount={appointmentCount}
        legendServices={legendServices}
        serviceColorMap={serviceColorMap}
        onViewModeChange={handleViewModeChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onSelectDate={handleSelectDate}
      />
    </div>
  );
};

export default AppointmentsCalendarContainer;
