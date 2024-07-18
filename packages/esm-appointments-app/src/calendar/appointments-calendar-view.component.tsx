import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import SelectedDateContext from '../hooks/selectedDateContext';
import { useParams } from 'react-router-dom';
import { omrsDateFormat } from '../constants';

const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().startOf('day').format(omrsDateFormat));
  const { calendarEvents } = useAppointmentsCalendar(dayjs(selectedDate).toISOString(), 'monthly');

  let params = useParams();

  useEffect(() => {
    if (params.date) {
      setSelectedDate(dayjs(params.date).startOf('day').format(omrsDateFormat));
    }
  }, [params.date]);

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      <div data-testid="appointments-calendar">
        <AppointmentsHeader title={'Calendar'} />
        <CalendarHeader />
        <MonthlyCalendarView events={calendarEvents} />
      </div>
    </SelectedDateContext.Provider>
  );
};

export default AppointmentsCalendarView;
