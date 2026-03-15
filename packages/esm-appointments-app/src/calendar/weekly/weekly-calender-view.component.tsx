import dayjs from 'dayjs';
import React from 'react';
import { getWeekDays } from '../../helpers';
import { useAppointmentsStore } from '../../store';
import { type DailyAppointmentsCountByService } from '../../types';
import calendarStyles from '../appointments-calendar-view-view.scss';
import styles from './weekly-calender-view.scss';
import WeeklyHeader from './weekly-header.component';
import WeeklyWorkloadCell from './weekly-workload-cell.component';

interface WeeklyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ events }) => {
  const { selectedDate } = useAppointmentsStore();
  const days = getWeekDays(dayjs(selectedDate));

  return (
    <div className={calendarStyles.calendarViewContainer}>
      <WeeklyHeader />
      <div className={styles.weekGrid}>
        {days.map((day, i) => (
          <WeeklyWorkloadCell key={i} dateTime={day} events={events} />
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
