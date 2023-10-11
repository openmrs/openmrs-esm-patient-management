import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import type { CalendarType } from '../types';
import AppointmentsHeader from '../appointments-header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import CalendarView from './calendar-view.component';
import { useAppointmentDate } from '../helpers';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const [calendarView, setCalendarView] = useState<CalendarType>('monthly');
  const { currentAppointmentDate, setCurrentAppointmentDate } = useAppointmentDate();
  const { calendarEvents } = useAppointmentsCalendar(dayjs(currentAppointmentDate).toISOString(), calendarView);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader onChangeView={setCalendarView} calendarView={calendarView} />
      <CalendarView
        calendarView={calendarView}
        events={calendarEvents}
        currentDate={dayjs(currentAppointmentDate)}
        setCurrentDate={setCurrentAppointmentDate}
      />
    </div>
  );
};

export default AppointmentsCalendarView;
