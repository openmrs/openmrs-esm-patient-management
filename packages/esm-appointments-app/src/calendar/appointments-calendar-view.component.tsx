import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useAppointmentsStore, setSelectedDate } from '../store';
import { type Appointment } from '../types';

export type CalendarView = 'monthly' | 'weekly' | 'daily';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const [currentView, setCurrentView] = useState<CalendarView>('monthly');

  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), currentView);

  const startDate = dayjs(selectedDate).startOf('month').format(omrsDateFormat);
  const endDate = dayjs(selectedDate).endOf('month').format(omrsDateFormat);

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

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader currentView={currentView} onViewChange={setCurrentView} />
      <MonthlyCalendarView events={calendarEvents} appointments={appointmentList} />
    </div>
  );
};

export default AppointmentsCalendarView;
