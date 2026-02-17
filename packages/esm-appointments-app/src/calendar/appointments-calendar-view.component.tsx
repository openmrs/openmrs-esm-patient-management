import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseDate, toCalendar, getLocalTimeZone } from '@internationalized/date';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { setSelectedDate, getSelectedCalendarDate, calendar } from '../store';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const calendarObject = getSelectedCalendarDate();
  const { calendarEvents } = useAppointmentsCalendar(calendarObject.toString(), 'monthly');

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      const date = toCalendar(parseDate(params.date), calendar);
      setSelectedDate(date.toDate(getLocalTimeZone()).toISOString());
    }
  }, [params.date]);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader calendar={calendar} />
      <MonthlyCalendarView events={calendarEvents} calendar={calendar} />
    </div>
  );
};

export default AppointmentsCalendarView;
