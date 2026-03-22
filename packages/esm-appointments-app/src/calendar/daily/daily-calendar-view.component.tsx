import React from 'react';
import dayjs from 'dayjs';
import MonthlyHeader from '../monthly/monthly-header.component';
import MonthlyWorkloadView from '../monthly/monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import { useAppointmentsStore } from '../../store';

/* Daily calendar view using reusable monthly components and shared header navigation */
const DailyCalendarView = ({ events }) => {
  /* Use selectedDate from global store to keep all views in sync */
  const { selectedDate } = useAppointmentsStore();

  const today = dayjs(selectedDate);

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader mode="daily" />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          <MonthlyWorkloadView dateTime={today} events={events} />
        </div>
      </div>
    </div>
  );
};

export default DailyCalendarView;
