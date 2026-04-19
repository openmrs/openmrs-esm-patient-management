import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from './weekly/weekly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import { useAppointmentsStore, type CalendarView } from '../store';
import { useSelectedDate } from '../hooks/useSelectedDate';
import { type DailyAppointmentsCountByService } from '../types';

const calendarViewMap: Record<CalendarView, React.FC<{ events: Array<DailyAppointmentsCountByService> }>> = {
  monthly: MonthlyCalendarView,
  weekly: WeeklyCalendarView,
  daily: DailyCalendarView,
};

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const { calendarView } = useAppointmentsStore();
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), calendarView);

  const ActiveView = calendarViewMap[calendarView];

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />
      <ActiveView events={calendarEvents} />
    </div>
  );
};

export default AppointmentsCalendarView;
