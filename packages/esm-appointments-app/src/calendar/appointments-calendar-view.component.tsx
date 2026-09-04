import React, { useState, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import AppointmentsHeader from '../header/appointments-header.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { type CalendarViewMode } from '../types';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import ServicesLegend from './services-legend.component';
import { buildServiceColorMap } from './utils/calendar-colors';
import styles from './appointments-calendar-view-view.scss';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));
  const [dailyAppointmentCount, setDailyAppointmentCount] = useState<number | null>(null);
  const { calendarEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), viewMode);
  const { serviceTypes } = useAppointmentServices();
  const serviceColorMap = useMemo(() => buildServiceColorMap(serviceTypes), [serviceTypes]);

  const monthlyAppointmentCount = useMemo(() => {
    if (!calendarEvents) return 0;
    return calendarEvents.reduce(
      (sum, event) =>
        sum + (event.services ?? []).reduce((serviceSum, service) => serviceSum + (service.count ?? 0), 0),
      0,
    );
  }, [calendarEvents]);

  const appointmentCount = viewMode === 'daily' ? dailyAppointmentCount : monthlyAppointmentCount;

  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') {
      setCalendarSelectedDate((d) => d.subtract(1, 'month'));
    } else {
      setDailyAppointmentCount(null);
      setCalendarSelectedDate((d) => d.subtract(1, 'day'));
    }
  }, [viewMode]);

  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') {
      setCalendarSelectedDate((d) => d.add(1, 'month'));
    } else {
      setDailyAppointmentCount(null);
      setCalendarSelectedDate((d) => d.add(1, 'day'));
    }
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    if (mode === 'daily') {
      setDailyAppointmentCount(null);
    }
    setViewMode(mode);
  }, []);

  const handleToday = useCallback(() => {
    if (viewMode === 'daily') {
      setDailyAppointmentCount(null);
    }
    setCalendarSelectedDate(dayjs());
  }, [viewMode]);

  const handleSelectDate = useCallback((isoDate: string) => {
    setDailyAppointmentCount(null);
    setCalendarSelectedDate(dayjs(isoDate));
    setViewMode('daily');
  }, []);

  const legendServices = useMemo(() => {
    const legendMap = new Map<string, { uuid: string; name: string }>();
    calendarEvents?.forEach((event) => {
      event.services?.forEach((service) => {
        const key = service.serviceUuid || service.serviceName;
        if (service.serviceName && key && !legendMap.has(key)) {
          legendMap.set(key, { name: service.serviceName, uuid: service.serviceUuid ?? key });
        }
      });
    });
    return Array.from(legendMap.values());
  }, [calendarEvents]);

  return (
    <div data-testid="appointments-calendar" className={styles.backgroundColor}>
      <AppointmentsHeader title={t('calendar', 'Calendar')} isCalendarView />
      <CalendarHeader
        viewMode={viewMode}
        calendarSelectedDate={calendarSelectedDate}
        appointmentCount={appointmentCount}
        onViewModeChange={handleViewModeChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      {viewMode === 'monthly' && (
        <MonthlyCalendarView
          events={calendarEvents}
          calendarSelectedDate={calendarSelectedDate}
          onSelectDate={handleSelectDate}
          serviceColorMap={serviceColorMap}
        />
      )}
      {viewMode === 'daily' && (
        <DailyCalendarView
          calendarSelectedDate={calendarSelectedDate}
          onAppointmentCountChange={setDailyAppointmentCount}
          serviceColorMap={serviceColorMap}
        />
      )}
      <ServicesLegend services={legendServices} serviceColorMap={serviceColorMap} />
    </div>
  );
};

export default AppointmentsCalendarView;
