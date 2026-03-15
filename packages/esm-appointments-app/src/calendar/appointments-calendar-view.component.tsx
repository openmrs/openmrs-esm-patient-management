import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { omrsDateFormat } from '../constants';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import { ContentSwitcher, Switch } from '@carbon/react';
import styles from './appointments-calendar-view-view.scss';
import DailyCalendarView from './daily/daily-calendar-view.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { setSelectedDate, useAppointmentsStore } from '../store';
import WeeklyCalendarView from './weekly/weekly-calender-view.component';

type CalendarViewType = 'monthly' | 'weekly' | 'daily';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const [currentView, setCurrentView] = useState<CalendarViewType>('monthly');
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), currentView);

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  const handleViewChange = ({ index }: { index: number }) => {
    const views: CalendarViewType[] = ['monthly', 'weekly', 'daily'];
    setCurrentView(views[index]);
  };

  const viewIndex = { monthly: 0, weekly: 1, daily: 2 }[currentView];

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />

      <div className={styles.viewSwitcher}>
        <ContentSwitcher size="sm" selectedIndex={viewIndex} onChange={handleViewChange}>
          <Switch name="monthly" text={t('monthly', 'Monthly')} />
          <Switch name="weekly" text={t('weekly', 'Weekly')} />
          <Switch name="daily" text={t('daily', 'Daily')} />
        </ContentSwitcher>
      </div>

      {currentView === 'monthly' && <MonthlyCalendarView events={calendarEvents} />}
      {currentView === 'weekly' && <WeeklyCalendarView events={calendarEvents} />}
      {currentView === 'daily' && <DailyCalendarView />}
    </div>
  );
};

export default AppointmentsCalendarView;
