import React, { useCallback } from 'react';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs, { type Dayjs } from 'dayjs';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import DaysOfWeekCard from './days-of-week.component';
import MonthlyViewWorkload from './monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import headerStyles from './monthly-header.scss';

dayjs.extend(isBetween);

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  calendarSelectedDate: Dayjs;
  setCalendarSelectedDate: React.Dispatch<React.SetStateAction<Dayjs>>;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  events,
  calendarSelectedDate,
  setCalendarSelectedDate,
}) => {
  const { t } = useTranslation();

  const handleSelectPrevMonth = useCallback(() => {
    setCalendarSelectedDate((prev) => prev.subtract(1, 'month'));
  }, [setCalendarSelectedDate]);

  const handleSelectNextMonth = useCallback(() => {
    setCalendarSelectedDate((prev) => prev.add(1, 'month'));
  }, [setCalendarSelectedDate]);

  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={headerStyles.container}>
          <Button
            aria-label={t('previousMonth', 'Previous month')}
            kind="tertiary"
            onClick={handleSelectPrevMonth}
            size="sm">
            {t('prev', 'Prev')}
          </Button>
          <span>{formatDate(calendarSelectedDate.toDate(), { day: false, time: false, noToday: true })}</span>
          <Button aria-label={t('nextMonth', 'Next month')} kind="tertiary" onClick={handleSelectNextMonth} size="sm">
            {t('next', 'Next')}
          </Button>
        </div>
        <div className={headerStyles.workLoadCard}>
          {DAYS_IN_WEEK.map((day) => (
            <DaysOfWeekCard key={day} dayOfWeek={day} />
          ))}
        </div>
      </>
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(calendarSelectedDate).map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              dateTime={dateTime}
              events={events}
              calendarSelectedDate={calendarSelectedDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
