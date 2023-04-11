import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsHeader from '../appointments-header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import CalendarView from './calendar-view.component';
import dayjs from 'dayjs';
import { CalendarType } from '../types';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const [calendarView, setCalendarView] = useState<CalendarType>('monthly');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const { calendarEvents, isLoading } = useAppointmentsCalendar(currentDate.toISOString(), calendarView);

  return (
    <div>
      <AppointmentsHeader title={t('appointments', 'Appointments')} />
      <CalendarHeader onChangeView={setCalendarView} calendarView={calendarView} />
      <CalendarView
        calendarView={calendarView}
        events={calendarEvents}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
    </div>
  );
};

export default AppointmentsCalendarView;
