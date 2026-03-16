import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsStore } from '../../store';
import { type DailyAppointmentsCountByService } from '../../types';
import styles from '../appointments-calendar-view-view.scss';

interface WeeklyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  onDayClick?: (date: string, serviceUuid?: string) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ events = [], onDayClick }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const weekStart = dayjs(selectedDate).startOf('week');
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const safeEvents = events ?? [];

  return (
    <div className={styles.calendarViewContainer} data-testid="weekly-calendar-view">
      <div className={styles.wrapper}>
        <p className={styles.stubLabel}>{t('weeklyView', 'Week view')}</p>
        <div className={styles.weekGrid}>
          {weekDays.map((day) => {
            const dateStr = day.format('YYYY-MM-DD');
            const dayEvents = safeEvents.find((e) => {
              try {
                return dayjs(e.appointmentDate).format('YYYY-MM-DD') === dateStr;
              } catch {
                return false;
              }
            });
            const total = dayEvents?.services?.reduce((sum, s) => sum + s.count, 0) ?? 0;
            return (
              <button key={dateStr} type="button" className={styles.weekDayCell} onClick={() => onDayClick?.(dateStr)}>
                <span className={styles.weekDayName}>{day.format('ddd')}</span>
                <span className={styles.weekDayDate}>{day.format('D')}</span>
                {total > 0 && <span className={styles.weekDayCount}>{total}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
