import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import { changeSelectedDate, useSelectedDate } from '../helpers';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useParams } from 'react-router-dom';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useSelectedDate();
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), 'monthly');

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      changeSelectedDate(params.date);
    }
  }, [params.date]);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />
      <MonthlyCalendarView events={calendarEvents} />
    </div>
  );
};

export default AppointmentsCalendarView;
