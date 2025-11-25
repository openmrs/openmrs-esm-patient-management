import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseDate, toCalendar, createCalendar } from '@internationalized/date';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useAppointmentsStore, setSelectedDate } from '../store';
import { getLocale, getDefaultCalendar } from '@openmrs/esm-utils';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const localCalendarName = getDefaultCalendar(getLocale());
  const { selectedDate } = useAppointmentsStore();
  const calendarObject = toCalendar(parseDate(selectedDate.split('T')[0]), createCalendar(localCalendarName));
  const { calendarEvents } = useAppointmentsCalendar(calendarObject.toString(), 'monthly');

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      const date = toCalendar(parseDate(params.date), createCalendar(localCalendarName));
      setSelectedDate(date.toString());
    }
  }, [localCalendarName, params.date]);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />
      <MonthlyCalendarView events={calendarEvents} />
    </div>
  );
};

export default AppointmentsCalendarView;
