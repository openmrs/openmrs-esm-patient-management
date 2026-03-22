import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../../constants';
import { useAppointmentsStore, setSelectedDate } from '../../store';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

/* Extend header to support navigation for different calendar views */
interface MonthlyHeaderProps {
  mode?: 'monthly' | 'weekly' | 'daily';
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({ mode = 'monthly' }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  /* Determine navigation unit dynamically based on active calendar view */
  const getUnit = useCallback(() => {
    if (mode === 'weekly') return 'week';
    if (mode === 'daily') return 'day';
    return 'month';
  }, [mode]);

  /* Navigate to previous period (month/week/day depending on mode) */
  const handleSelectPrev = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).subtract(1, getUnit()).format(omrsDateFormat));
  }, [selectedDate, getUnit]);

  /* Navigate to next period (month/week/day depending on mode) */
  const handleSelectNext = useCallback(() => {
    setSelectedDate(dayjs(selectedDate).add(1, getUnit()).format(omrsDateFormat));
  }, [selectedDate, getUnit]);

  return (
    <>
      <div className={styles.container}>
        <Button aria-label={t('previous', 'Previous')} kind="tertiary" onClick={handleSelectPrev} size="sm">
          {t('prev', 'Prev')}
        </Button>

        {/* Display formatted selected date (updates dynamically with navigation) */}
        <span>{formatDate(new Date(selectedDate), { day: false, time: false, noToday: true })}</span>

        <Button aria-label={t('next', 'Next')} kind="tertiary" onClick={handleSelectNext} size="sm">
          {t('next', 'Next')}
        </Button>
      </div>

      {/* Show days-of-week header for monthly and weekly views only */}
      <div className={styles.workLoadCard}>
        {mode === 'daily' ? (
          <div style={{ width: '14.28%' }}>
            <DaysOfWeekCard dayOfWeek={dayjs(selectedDate).format('ddd').toUpperCase()} />
          </div>
        ) : (
          /* Full week (monthly + weekly) */
          DAYS_IN_WEEK.map((day) => <DaysOfWeekCard key={day} dayOfWeek={day} />)
        )}
      </div>
    </>
  );
};

export default MonthlyHeader;
