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
}
const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ calendarWorkload, dateToDisplay = '' }) => {
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);

  const monthViewDate = dateToDisplay === '' ? selectedDate : dateToDisplay;
  const handleDivClick = (date) => {
    setSelectedDate(date);
  };

  const { t } = useTranslation();

  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={styles.container}></div>
        <div className={styles.workLoadCard}>
          {daysInWeek?.map((day, i) => <DaysOfWeekCard key={`${day}-${i}`} dayOfWeek={day} />)}
        </div>
        <div className={styles.wrapper}>
          <div className={styles.monthlyCalendar}>
            {monthDays(dayjs(monthViewDate)).map((dateTime, i) => (
              <div key={i} onClick={() => handleDivClick(dateTime)} className={styles.monthlyWorkloadCard}>
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
