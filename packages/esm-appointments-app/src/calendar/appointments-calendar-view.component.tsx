import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useAppointmentsStore } from '../store';

/* Import calendar view style */
import styles from './appointments-calendar-view-view.scss';

/* Import calendar view switcher and additional calendar view components */
import CalendarViewSwitcher from '../calendar/appointment-calendar-view-switcher.component';
import WeeklyCalendarView from '../calendar/weekly/weekly-calendar-view.component';
import DailyCalendarView from '../calendar/daily/daily-calendar-view.component';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();

  /* Use global store as single source of truth */
  const { selectedDate, calendarView } = useAppointmentsStore();

  /* Fetch events dynamically based on selected view */
  const { calendarEvents } = useAppointmentsCalendar(
    dayjs(selectedDate).toISOString(),
    calendarView
  );

  return (
    <div data-testid="appointments-calendar" className={styles.calendarViewContainer}>
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />

      {/* Dropdown to switch between Month / Week / Day views */}
      <CalendarViewSwitcher />

      {/* Render only the selected calendar view */}
      {calendarView === 'monthly' && <MonthlyCalendarView events={calendarEvents} />}
      {calendarView === 'weekly' && <WeeklyCalendarView events={calendarEvents} />}
      {calendarView === 'daily' && <DailyCalendarView events={calendarEvents} />}
    </div>
  );
};

export default AppointmentsCalendarView;
