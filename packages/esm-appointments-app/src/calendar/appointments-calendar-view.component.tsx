import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { omrsDateFormat } from '../constants';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from './weekly/weekly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import DayAppointmentsModal from './day-appointments-modal.component';
import { useAppointmentsStore, setSelectedDate } from '../store';

export type CalendarViewMode = 'monthly' | 'weekly' | 'daily';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    date: string | null;
    serviceUuid: string | null;
  }>({ isOpen: false, date: null, serviceUuid: null });

  const period = viewMode === 'daily' ? 'daily' : viewMode === 'weekly' ? 'weekly' : 'monthly';
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), period);

  const params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  const openDayModal = useCallback((date: string, serviceUuid?: string) => {
    setModalState({ isOpen: true, date, serviceUuid: serviceUuid ?? null });
  }, []);

  const closeDayModal = useCallback(() => {
    setModalState((s) => ({ ...s, isOpen: false }));
  }, []);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader viewMode={viewMode} onViewModeChange={setViewMode} />
      {viewMode === 'monthly' && <MonthlyCalendarView events={calendarEvents} onDayClick={openDayModal} />}
      {viewMode === 'weekly' && <WeeklyCalendarView events={calendarEvents} onDayClick={openDayModal} />}
      {viewMode === 'daily' && <DailyCalendarView events={calendarEvents} onDayClick={openDayModal} />}
      <DayAppointmentsModal
        isOpen={modalState.isOpen}
        onClose={closeDayModal}
        date={modalState.date}
        serviceUuid={modalState.serviceUuid}
      />
    </div>
  );
};

export default AppointmentsCalendarView;
