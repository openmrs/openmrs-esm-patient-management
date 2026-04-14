import React, { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useSelectedDate } from '../hooks/useSelectedDate';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Dayjs>(dayjs(selectedDate));

  const { calendarEvents } = useAppointmentsCalendar(calendarSelectedDate.toISOString(), 'monthly');

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />
      <MonthlyCalendarView
        events={calendarEvents}
        calendarSelectedDate={calendarSelectedDate}
        setCalendarSelectedDate={setCalendarSelectedDate}
      />
    </div>
  );
};

export default AppointmentsCalendarView;
