import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsHeader from '../../../appointments-header/appointments-header.component';
import CalendarHeader from '../Header/calendar-header.component';
import MonthlyCalendarView from './MonthlyCalendar';

interface AppointmentsCalendarListViewProps {}

type CalendarView = 'daily' | 'weekly' | 'monthly';

const CalendarView: React.FC<AppointmentsCalendarListViewProps> = () => {
  const { t } = useTranslation();
  const [calendarView, setCalendarView] = useState<CalendarView>('monthly');
  return (
    <div style={{ backgroundColor: 'white' }}>
      <AppointmentsHeader title={t('appointments', 'Appointments')} />
      <CalendarHeader onChangeView={setCalendarView} calendarView={calendarView} />
      {calendarView === 'monthly' && <MonthlyCalendarView type="monthly" events={events} />}
    </div>
  );
};

export default CalendarView;
const events = [
  {
    appointmentDate: '2022-12-30 05:20:00',
    service: [
      { serviceName: 'HIV', count: 10 },
      { serviceName: 'Lab testing', count: 7 },
      { serviceName: 'Refill', count: 15 },
    ],
  },
  {
    appointmentDate: '2022-12-28 10:20:00',
    service: [
      { serviceName: 'HIV', count: 5 },
      { serviceName: 'Lab testing', count: 3 },
      { serviceName: 'Refill', count: 1 },
    ],
  },
  {
    appointmentDate: '2022-11-24 09:20:00',
    service: [
      { serviceName: 'Test', count: 10 },
      { serviceName: 'Lab testing', count: 10 },
    ],
  },
  {
    appointmentDate: '2022-11-21 10:00:00',
    service: [
      { serviceName: 'HIV', count: 1 },
      { serviceName: 'Lab testing', count: 1 },
      { serviceName: 'Refill', count: 1 },
    ],
  },
  {
    appointmentDate: '2022-11-18 08:20:00',
    service: [
      { serviceName: 'HIV', count: 21 },
      { serviceName: 'Drug Pickup', count: 4 },
      { serviceName: 'Lab testing', count: 10 },
      { serviceName: 'Refill', count: 3 },
    ],
  },
  {
    appointmentDate: '2022-11-14 12:20:00',
    service: [
      { serviceName: 'HIV', count: 10 },
      { serviceName: 'Refill', count: 2 },
    ],
  },
  {
    appointmentDate: '2022-11-11 14:20:00',
    service: [
      { serviceName: 'HIV', count: 1 },
      { serviceName: 'Lab testing', count: 10 },
    ],
  },
  {
    appointmentDate: '2022-11-08 13:20:00',
    service: [
      { serviceName: 'HIV', count: 10 },
      { serviceName: 'Lab testing', count: 10 },
      { serviceName: 'Refill', count: 15 },
    ],
  },
  {
    appointmentDate: '2022-10-27 15:20:00',
    service: [
      { serviceName: 'HIV', count: 1 },
      { serviceName: 'Drug pickup', count: 4 },
      { serviceName: 'Refill', count: 1 },
    ],
  },
  {
    appointmentDate: '2022-10-22 17:20:00',
    service: [{ serviceName: 'HIV', count: 13 }],
  },
];
