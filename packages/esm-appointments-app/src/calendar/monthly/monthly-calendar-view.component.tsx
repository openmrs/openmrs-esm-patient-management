import React from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import { CALENDAR_SYSTEMS } from '../calendar-systems';

dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  navIsoDate: string;
  calendarSystemKey?: string;
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  events,
  navIsoDate,
  calendarSystemKey = 'gregory',
  onSelectDate,
}) => {
  const cs = CALENDAR_SYSTEMS[calendarSystemKey];

  // Build the 7 day-of-week labels in the correct order for this calendar system
  const orderedDowLabels = [...cs.daysOfWeek.slice(cs.firstDayOfWeek), ...cs.daysOfWeek.slice(0, cs.firstDayOfWeek)];

  return (
    <div className={styles.calendarViewContainer}>
      {/* Days-of-week header row */}
      <div className={styles.workLoadCard}>
        {orderedDowLabels.map((label, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.5rem 0',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#4b5563',
              borderBottom: '1px solid #e5e7eb',
            }}>
            {label}
          </div>
        ))}
      </div>
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(dayjs(navIsoDate)).map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              dateTime={dateTime}
              events={events}
              navIsoDate={navIsoDate}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
