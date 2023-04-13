import React from 'react';
import DailyCalendarView from './daily/daily-calendar-view.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from './weekly/weekly-calendar-view.component';
import { CalendarType } from '../types';

const CalendarView: React.FC<{
  calendarView: CalendarType;
  events: any;
  currentDate: any;
  setCurrentDate: any;
}> = ({ calendarView, events, currentDate, setCurrentDate }) => {
  switch (calendarView) {
    case 'monthly':
      return (
        <MonthlyCalendarView type="monthly" events={events} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      );
    case 'weekly':
      return (
        <WeeklyCalendarView type="weekly" events={events} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      );
    case 'daily':
      return (
        <DailyCalendarView type="daily" events={events} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      );
    default:
      return null;
  }
};

export default CalendarView;
