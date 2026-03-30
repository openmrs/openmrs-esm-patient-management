import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from '../calendar/weekly/weekly-calendar-view.component';
import DailyCalendarView from '../calendar/daily/daily-calendar-view.component';
import CalendarViewSwitcher from '../calendar/appointment-calendar-view-switcher.component';
import { useAppointmentsStore } from '../store';
import { useSelectedDate } from '../hooks/useSelectedDate';

import styles from './appointments-calendar-view-view.scss';

const AppointmentsCalendarView: React.FC = () => {
  /* Enable translation for UI text */
  const { t } = useTranslation();

  /* Get selected date from URL as the single source of truth */
  const selectedDate = useSelectedDate();

  /* Get current calendar view from global UI state */
  const { calendarView } = useAppointmentsStore();

  /* Fetch calendar data based on selected date and active view */
  const { calendarEvents, isLoading, error } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), calendarView);

  /* Resolve which calendar view component to render */
  const calendarViewComponent = useMemo(() => {
    if (calendarView === 'monthly') {
      return <MonthlyCalendarView events={calendarEvents} />;
    }

    if (calendarView === 'weekly') {
      return <WeeklyCalendarView events={calendarEvents} />;
    }

    if (calendarView === 'daily') {
      return <DailyCalendarView events={calendarEvents} />;
    }

    return null;
  }, [calendarView, calendarEvents]);

  return (
    <div data-testid="appointments-calendar" className={styles.calendarViewContainer}>
      <div className={styles.calendarShell}>
        <AppointmentsHeader title={t('calendar', 'Calendar')} />
        <CalendarHeader />
        <CalendarViewSwitcher />

        {/* Show loading indicator while fetching data */}
        {isLoading && (
          <div className={styles.loadingContainer}>
            <InlineLoading description={t('loading', 'Loading...')} />
          </div>
        )}

        {/* Display error message if data fetch fails */}
        {error && <div>{t('errorLoadingCalendar', 'Error loading calendar data')}</div>}

        {/* Render selected calendar view once data is ready */}
        {!isLoading && !error && calendarViewComponent}
      </div>
    </div>
  );
};

export default AppointmentsCalendarView;
