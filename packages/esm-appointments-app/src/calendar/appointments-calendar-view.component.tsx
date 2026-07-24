import React, { useState, useCallback } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import CalendarHeader, { type CalendarViewMode } from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from './weekly/weekly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import { deriveCalKey } from './calendar-utils';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const calSysKey = deriveCalKey();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));
  const period = viewMode === 'weekly' ? 'weekly' : viewMode === 'daily' ? 'daily' : 'monthly';
  const { calendarEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), period);

  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => d.subtract(1, 'month'));
    else if (viewMode === 'weekly') setCalendarSelectedDate((d) => d.subtract(7, 'day'));
    else setCalendarSelectedDate((d) => d.subtract(1, 'day'));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') setCalendarSelectedDate((d) => d.add(1, 'month'));
    else if (viewMode === 'weekly') setCalendarSelectedDate((d) => d.add(7, 'day'));
    else setCalendarSelectedDate((d) => d.add(1, 'day'));
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} showNewAppointmentButton />
      <CalendarHeader
        viewMode={viewMode}
        calendarSelectedDate={calendarSelectedDate}
        onViewModeChange={handleViewModeChange}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      {viewMode === 'monthly' && (
        <MonthlyCalendarView events={calendarEvents} calendarSelectedDate={calendarSelectedDate} calKey={calSysKey} />
      )}
      {viewMode === 'weekly' && (
        <WeeklyCalendarView calKey={calSysKey} calendarSelectedDate={calendarSelectedDate} onSelectDate={() => {}} />
      )}
      {viewMode === 'daily' && <DailyCalendarView calKey={calSysKey} calendarSelectedDate={calendarSelectedDate} />}
    </div>
  );
};

export default AppointmentsCalendarView;
