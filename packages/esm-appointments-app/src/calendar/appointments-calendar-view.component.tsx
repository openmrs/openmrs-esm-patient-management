import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import { useAppointmentDate } from '../helpers';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { currentAppointmentDate, setCurrentAppointmentDate } = useAppointmentDate();
  const { calendarEvents } = useAppointmentsCalendar(dayjs(currentAppointmentDate).toISOString(), 'monthly');

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />
      <MonthlyCalendarView
        events={calendarEvents}
        currentDate={dayjs(currentAppointmentDate)}
        setCurrentDate={setCurrentAppointmentDate}
      />
    </div>
  );
};

export default AppointmentsCalendarView;
