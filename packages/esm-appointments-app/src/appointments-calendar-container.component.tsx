import React, { useState, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useAppointmentsCalendar } from './hooks/useAppointmentsCalendar';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useServiceFilter } from './filter/use-service-filter';
import ServiceFilter from './filter/service-filter.component';
import CalendarPageHeader from './calendar/header/calendar-page-header.component';
import CalendarView from './calendar/calendar-view.component';
import { buildServiceColorMap } from './calendar/utils/calendar-colors';
import { type CalendarViewMode } from './types';
import styles from './calendar/appointments-calendar-view-view.scss';

const AppointmentsCalendarContainer: React.FC = () => {
  const selectedDate = useSelectedDate();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));

  const { selectedServiceUuids, serviceTypes, serviceOptions, onServiceChange } = useServiceFilter();
  const serviceColorMap = useMemo(() => buildServiceColorMap(serviceTypes), [serviceTypes]);

  const { calendarEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), viewMode, {
    serviceUuids: selectedServiceUuids,
  });

  const appointmentCount = useMemo(
    () =>
      (calendarEvents ?? []).reduce(
        (sum, event) => sum + (event.services ?? []).reduce((s, svc) => s + (svc.count ?? 0), 0),
        0,
      ),
    [calendarEvents],
  );

  const legendServices = useMemo(() => {
    const map = new Map<string, { uuid: string; name: string }>();
    (calendarEvents ?? []).forEach((event) => {
      event.services?.forEach((svc) => {
        const key = svc.serviceUuid || svc.serviceName;
        if (svc.serviceName && key && !map.has(key)) {
          map.set(key, { name: svc.serviceName, uuid: svc.serviceUuid ?? key });
        }
      });
    });
    return Array.from(map.values());
  }, [calendarEvents]);

  const serviceOptionsWithColor = useMemo(
    () => serviceOptions.map((option) => ({ ...option, color: serviceColorMap.get(option.uuid) })),
    [serviceOptions, serviceColorMap],
  );

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
          <ServiceFilter options={serviceOptionsWithColor} selected={selectedServiceUuids} onChange={onServiceChange} />
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
