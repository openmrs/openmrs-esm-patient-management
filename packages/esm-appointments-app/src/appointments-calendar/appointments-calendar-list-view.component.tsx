import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsHeader from '../appointments-header/appointments-header.component';
import CalendarHeader from './calendar-header.component';
import MonthlyCalendarView from './monthly-calendar-view.component';
import styles from './appointments-calendar-list-view.scss';
import WeeklyCalendarView from './weekly-calendar-view.component';
import DailyCalendarView from './daily-calendar-view.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import dayjs from 'dayjs';

type AppointmentsCalendarListView = 'daily' | 'weekly' | 'monthly';

const AppointmentsCalendarListView: React.FC = () => {
  const { t } = useTranslation();
  const [calendarView, setCalendarView] = useState<AppointmentsCalendarListView>('monthly');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const { calendarEvents, isLoading } = useAppointmentsCalendar(currentDate.toISOString(), calendarView);

  return (
    <div className={styles.backgroundColor}>
      <AppointmentsHeader title={t('appointments', 'Appointments')} />
      <CalendarHeader onChangeView={setCalendarView} calendarView={calendarView} />
      {calendarView === 'monthly' && (
        <MonthlyCalendarView
          type="monthly"
          events={calendarEvents}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      )}
      {calendarView === 'weekly' && (
        <WeeklyCalendarView
          type="weekly"
          events={calendarEvents}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      )}
      {calendarView === 'daily' && (
        <DailyCalendarView
          type="daily"
          events={calendarEvents}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      )}
    </div>
  );
};

export default AppointmentsCalendarListView;
