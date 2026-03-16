import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsStore } from '../../store';
import { type DailyAppointmentsCountByService } from '../../types';
import { formatDate } from '@openmrs/esm-framework';
import styles from '../appointments-calendar-view-view.scss';

interface DailyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  onDayClick?: (date: string, serviceUuid?: string) => void;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ events = [], onDayClick }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
  const safeEvents = events ?? [];
  const dayEvents = safeEvents.find((e) => {
    try {
      return dayjs(e.appointmentDate).format('YYYY-MM-DD') === dateStr;
    } catch {
      return false;
    }
  });
  const total = dayEvents?.services?.reduce((sum, s) => sum + s.count, 0) ?? 0;

  return (
    <div className={styles.calendarViewContainer} data-testid="daily-calendar-view">
      <div className={styles.wrapper}>
        <p className={styles.stubLabel}>{t('dailyView', 'Day view')}</p>
        <button type="button" className={styles.dayCell} onClick={() => onDayClick?.(dateStr)}>
          <span className={styles.dayCellDate}>
            {formatDate(new Date(selectedDate), { day: true, month: true, year: true, time: false })}
          </span>
          <span className={styles.dayCellCount}>
            {total} {t('appointments', 'appointments')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DailyCalendarView;
