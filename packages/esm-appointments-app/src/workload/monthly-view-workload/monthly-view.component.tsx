import dayjs from 'dayjs';
import React, { useContext, useState } from 'react';
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
  const [currentMonth, setCurrentMonth] = useState(dayjs(dateToDisplay === '' ? selectedDate : dateToDisplay));
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(null); // Rename selectedDate to selectedDateState

  const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

  const handleClick = (date: string) => {
    const pickedDate = dayjs(date);
    const today = dayjs();
    if ((pickedDate.isSame(today, 'day') || pickedDate.isAfter(today, 'day')) && onDateClick) {
      onDateClick(pickedDate.toDate());
    }
    setSelectedDateState(pickedDate.toDate()); // Update selectedDate to selectedDateState
    // Check if the selected date belongs to a different month
    if (pickedDate.month() !== currentMonth.month()) {
      setCurrentMonth(pickedDate);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const { t } = useTranslation();
  const daysInWeeks = daysInWeek.map((day) => t(day));

  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={styles.container}>
          <button
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '25px' }}
            type="button"
            onClick={handlePrevMonth}>
            «
          </button>
          <span className={styles.headerContainer}>{currentMonth.format(monthFormat)}</span>
          <button
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '25px' }}
            type="button"
            onClick={handleNextMonth}>
            »
          </button>
        </div>
        <div className={styles.workLoadCard}>
          {daysInWeeks?.map((day, i) => <DaysOfWeekCard key={`${day}-${i}`} dayOfWeek={day} />)}
        </div>
        <div className={styles.wrapper}>
          <div className={styles.monthlyCalendar}>
            {monthDays(currentMonth).map((dateTime, i) => (
              <div
                onClick={() => handleClick(dateTime.format('YYYY-MM-DD'))}
                key={i}
                className={`${styles.monthlyWorkloadCard} ${
                  dayjs(dateTime).format('YYYY-MM-DD') === dayjs(currentMonth).format('YYYY-MM-DD')
                    ? styles.selectedDate
                    : ''
                }`}>
                <MonthlyWorkloadCard
                  key={i}
                  date={dateTime}
                  isActive={dayjs(dateToDisplay).format('DD-MM-YYYY') === dayjs(dateTime).format('DD-MM-YYYY')}
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

