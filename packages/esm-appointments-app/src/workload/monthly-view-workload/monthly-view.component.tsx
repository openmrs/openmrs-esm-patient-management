import dayjs from 'dayjs';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DaysOfWeekCard from '../../calendar/monthly/days-of-week.component';
import { monthDays } from '../../helpers';
import SelectedDateContext from '../../hooks/selectedDateContext';
import styles from './monthly-workload.scss';
import MonthlyWorkloadCard from './monthlyWorkCard';

interface MonthlyCalendarViewProps {
  calendarWorkload: Array<{ count: number; date: string }>;
  dateToDisplay?: string;
  onDateClick?: (pickedDate: Date) => void;
}
const monthFormat = 'MMMM, YYYY';
const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  calendarWorkload,
  dateToDisplay = '',
  onDateClick,
}) => {
  const { selectedDate } = useContext(SelectedDateContext);
  const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
  const monthViewDate = dateToDisplay === '' ? selectedDate : dateToDisplay;
  const handleClick = (date: string) => {
    const parsedDate = new Date(date);
    if (onDateClick) {
      onDateClick(parsedDate);
    }
  };
  const { t } = useTranslation();
  const daysInWeeks = daysInWeek.map((day) => t(day));
  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={styles.container}></div>
        <span className={styles.headerContainer}>{dayjs(monthViewDate).format(monthFormat)}</span>
        <div className={styles.workLoadCard}>
          {daysInWeeks?.map((day, i) => <DaysOfWeekCard key={`${day}-${i}`} dayOfWeek={day} />)}
        </div>
        <div className={styles.wrapper}>
          <div className={styles.monthlyCalendar}>
            {monthDays(dayjs(monthViewDate)).map((dateTime, i) => (
              <div
                onClick={() => handleClick(dayjs(dateTime).format('YYYY-MM-DD'))}
                key={i}
                className={styles.monthlyWorkloadCard}>
                <MonthlyWorkloadCard
                  key={i}
                  date={dateTime}
                  isActive={dayjs().format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY')}
                  count={
                    calendarWorkload.find((calendar) => calendar.date === dayjs(dateTime).format('YYYY-MM-DD'))
                      ?.count ?? 0
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  );
};

export default MonthlyCalendarView;
//onClick={() => handleClick(dayjs(dateTime).format('YYYY-MM-DD'))} // Pass date on click
