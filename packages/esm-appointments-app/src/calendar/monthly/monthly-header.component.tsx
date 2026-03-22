import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

/* Extend header to support navigation for different calendar views */
interface MonthlyHeaderProps {
  mode?: 'monthly' | 'weekly' | 'daily';
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({ mode = 'monthly' }) => {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();

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
        {/* Previous navigation button */}
        <Button
          aria-label={t('previous', 'Previous')}
          kind="tertiary"
          onClick={handleSelectPrev}
          size="sm">
          {t('prev', 'Prev')}
        </Button>

        {/* Display current selected date */}
        <span>
          {formatDate(new Date(selectedDate), {
            day: false,
            time: false,
            noToday: true,
          })}
        </span>

        {/* Next navigation button */}
        <Button
          aria-label={t('next', 'Next')}
          kind="tertiary"
          onClick={handleSelectNext}
          size="sm">
          {t('next', 'Next')}
        </Button>
      </div>

      {/* Weekday header rendering */}
      <div className={styles.workLoadCard}>
        {mode === 'daily' ? (
          /* Show ONLY one day for daily view */
          <div style={{ width: '14.28%' }}>
            <DaysOfWeekCard
              dayOfWeek={dayjs(selectedDate).format('ddd').toUpperCase()}
            />
          </div>
        ) : (
          /* Show full week for monthly + weekly views */
          DAYS_IN_WEEK.map((day) => (
            <DaysOfWeekCard key={day} dayOfWeek={day} />
          ))
        )}
      </div>
    </>
  );
};

export default MonthlyHeader;
