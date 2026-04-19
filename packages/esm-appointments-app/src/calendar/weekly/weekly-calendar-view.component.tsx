import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../../constants';
import { weekDays } from '../../helpers';
import { useAppointmentsStore, setSelectedDate } from '../../store';
import { type DailyAppointmentsCountByService } from '../../types';
import WeeklyWorkloadView from './weekly-workload-view.component';
import styles from './weekly-calendar-view.scss';

interface WeeklyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ events }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const days = weekDays(dayjs(selectedDate));

  const handlePrevWeek = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).subtract(1, 'week').format(omrsDateFormat));
  }, [selectedDate]);

  const handleNextWeek = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).add(1, 'week').format(omrsDateFormat));
  }, [selectedDate]);

  const weekStart = days[0];
  const weekEnd = days[6];
  const rangeLabel =
    weekStart.month() === weekEnd.month()
      ? `${weekStart.format('MMM D')} – ${weekEnd.format('D, YYYY')}`
      : `${weekStart.format('MMM D')} – ${weekEnd.format('MMM D, YYYY')}`;

  return (
    <div className={styles.weeklyCalendarContainer}>
      <div className={styles.weeklyHeader}>
        <Button kind="tertiary" size="sm" onClick={handlePrevWeek} aria-label={t('previousWeek', 'Previous week')}>
          {t('prev', 'Prev')}
        </Button>
        <span className={styles.weekLabel}>{rangeLabel}</span>
        <Button kind="tertiary" size="sm" onClick={handleNextWeek} aria-label={t('nextWeek', 'Next week')}>
          {t('next', 'Next')}
        </Button>
      </div>

      <div className={styles.weeklyGrid}>
        {days.map((day, i) => (
          <div key={i} className={styles.dayColumn}>
            <div className={styles.dayHeader}>
              <span className={styles.dayName}>{day.format('ddd').toUpperCase()}</span>
              <span className={styles.dayDate}>{day.format('D')}</span>
            </div>
            <WeeklyWorkloadView dateTime={day} events={events} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
