import React, { useState, useCallback, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../constants';
import { useAppointmentsByDate } from '../hooks/useAppointmentsByDate';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import AppointmentsHeader from '../header/appointments-header.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { type CalendarViewMode } from '../types';
import { addCalendarMonths, getCalendarFormat } from './calendar-utils';
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
  const { calendarEvents, isLoading, error } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), viewMode);
  const { serviceTypes } = useAppointmentServices();
  const serviceColorMap = useMemo(() => buildServiceColorMap(serviceTypes), [serviceTypes]);

  const { calendar } = getCalendarFormat();

  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => addCalendarMonths(d, -1, calendar));
    else setCalendarSelectedDate((d) => d.subtract(1, 'day'));
  }, [viewMode, calendar]);

  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => addCalendarMonths(d, 1, calendar));
    else setCalendarSelectedDate((d) => d.add(1, 'day'));
  }, [viewMode, calendar]);

  const handleToday = useCallback(() => {
    setCalendarSelectedDate(dayjs());
  }, []);

  const handleBack = useCallback(() => {
    navigate({ to: `${spaHomePage}/appointments` });
  }, []);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
  }, []);

  const handleSelectDate = useCallback((isoDate: string) => {
    setCalendarSelectedDate(dayjs(isoDate));
    setViewMode('daily');
  }, []);

  const dailyIsoDate = viewMode === 'daily' ? calendarSelectedDate.format('YYYY-MM-DD') : null;
  const {
    appointments: dailyAppointments,
    isLoading: isLoadingDaily,
    error: dailyError,
  } = useAppointmentsByDate(dailyIsoDate);

  const appointmentsCount = useMemo(() => {
    if (viewMode === 'daily') {
      return isLoadingDaily || dailyError ? null : dailyAppointments.length;
    }
    if (isLoading || error) {
      return null;
    }
    const services = calendarEvents?.flatMap((event) => event.services ?? []) ?? [];
    return services.reduce((total, service) => total + (service.count ?? 0), 0);
  }, [viewMode, dailyAppointments.length, isLoadingDaily, dailyError, calendarEvents, isLoading, error]);

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
      <div className={styles.calendarContent}>
        <CalendarHeader
          viewMode={viewMode}
          calendarSelectedDate={calendarSelectedDate}
          appointmentsCount={appointmentsCount}
          onViewModeChange={handleViewModeChange}
          onToday={handleToday}
          onPrev={handlePrev}
          onNext={handleNext}
          onBack={handleBack}
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
          <DailyCalendarView calendarSelectedDate={calendarSelectedDate} serviceColorMap={serviceColorMap} />
        )}
      </div>
      <ServicesLegend services={legendServices} serviceColorMap={serviceColorMap} />
    </div>
  );
};

export default AppointmentsCalendarView;
