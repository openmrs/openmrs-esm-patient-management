import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { omrsDateFormat } from '../constants';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useAppointmentsStore, setSelectedDate, setCurrentView } from '../store';

type CalendarView = 'daily' | 'weekly' | 'monthly';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate, currentView } = useAppointmentsStore();
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), currentView);
  const params = useParams();
  const viewOptions: CalendarView[] = ['daily', 'weekly', 'monthly'];
  const selectedIndex = viewOptions.indexOf(currentView);
import { useAppointmentsStore } from '../store';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate } = useAppointmentsStore();
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), 'monthly');

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date, setSelectedDate]);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <div style={{ marginBottom: '1rem' }}>
        <ContentSwitcher
          size="md"
          onChange={({ name }) => setCurrentView(name as CalendarView)}
          selectedIndex={selectedIndex}>
          <Switch name="daily" text={t('daily', 'Daily')} />
          <Switch name="weekly" text={t('weekly', 'Weekly')} />
          <Switch name="monthly" text={t('monthly', 'Monthly')} />
        </ContentSwitcher>
      </div>
      <CalendarHeader />
      {currentView === 'monthly' && <MonthlyCalendarView events={calendarEvents} />}
      {currentView === 'weekly' && (
        <>
          {/* TODO: Implement WeeklyCalendarView component */}
          <p>{t('weeklyViewComingSoon', 'Weekly view coming soon')}</p>
        </>
      )}
      {currentView === 'daily' && (
        <>
          {/* TODO: Implement DailyCalendarView component */}
          <p>{t('dailyViewComingSoon', 'Daily view coming soon')}</p>
        </>
      )}
    </div>
  );
};

export default AppointmentsCalendarView;
