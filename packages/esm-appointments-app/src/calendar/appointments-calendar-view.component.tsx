import React, { useState } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { useSelectedDate } from '../hooks/useSelectedDate';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { type Appointment } from '../types';

export type CalendarView = 'monthly' | 'weekly' | 'daily';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const [currentView, setCurrentView] = useState<CalendarView>('monthly');

  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), currentView);

  const startDate = dayjs(selectedDate).startOf('month').toISOString();
  const endDate = dayjs(selectedDate).endOf('month').toISOString();

  const fetcher = ([url, start, end]) =>
    openmrsFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { startDate: start, endDate: end },
    });

  const { data } = useSWR<{ data: Array<Appointment> }>(
    [`${restBaseUrl}/appointments/search`, startDate, endDate],
    fetcher,
    { errorRetryCount: 2 },
  );

  const appointmentList = data?.data ?? [];

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader currentView={currentView} onViewChange={setCurrentView} />
      <MonthlyCalendarView events={calendarEvents} appointments={appointmentList} />
    </div>
  );
};

export default AppointmentsCalendarView;
