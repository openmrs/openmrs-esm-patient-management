import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { omrsDateFormat } from '../constants';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useAppointmentsStore, setSelectedDate } from '../store';

/* Import calendar view style */
import styles from './appointments-calendar-view-view.scss';

/* Import calendar view switcher and additional calendar view components */
import CalendarViewSwitcher from '../calendar/appointment-calendar-view-switcher.component';
import WeeklyCalendarView from '../calendar/weekly/weekly-calendar-view.component';
import DailyCalendarView from '../calendar/daily/daily-calendar-view.component';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();

  /* Retrieve current calendar view along with selected date from global store */
  const { selectedDate, calendarView } = useAppointmentsStore();

  /* Fetch calendar events based on selected date and active calendar view */
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), calendarView);

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  return (
    <div data-testid="appointments-calendar" className={styles.calendarViewContainer}>
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />

      {/* UI control for switching between calendar views */}
      <CalendarViewSwitcher />

      {/* Render calendar view dynamically based on selected calendarView */}
      {calendarView === 'monthly' && <MonthlyCalendarView events={calendarEvents} />}
      {calendarView === 'weekly' && <WeeklyCalendarView events={calendarEvents} />}
      {calendarView === 'daily' && <DailyCalendarView events={calendarEvents} />}
    </div>
  );
};

export default AppointmentsCalendarView;
