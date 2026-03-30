import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { useNavigate } from 'react-router-dom';

import DaysOfWeekCard from './days-of-week.component';
import styles from './monthly-header.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';

/* Static weekday labels used for rendering header */
const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface MonthlyHeaderProps {
  mode?: 'monthly' | 'weekly' | 'daily';
}

const MonthlyHeader: React.FC<MonthlyHeaderProps> = ({ mode = 'monthly' }) => {
  /* Enable i18n translations */
  const { t } = useTranslation();

  /* Router navigation for date transitions */
  const navigate = useNavigate();

  /* Centralized selected date shared across calendar views */
  const selectedDate = useSelectedDate();

  /* Determine navigation granularity based on current view mode */
  const unit = mode === 'weekly' ? 'week' : mode === 'daily' ? 'day' : 'month';

  /* Navigate to previous date based on current view unit */
  const handleSelectPrev = () => {
    const newDate = dayjs(selectedDate).subtract(1, unit).format('YYYY-MM-DD');
    navigate(`/calendar/${newDate}`);
  };

  /* Navigate to next date based on current view unit */
  const handleSelectNext = () => {
    const newDate = dayjs(selectedDate).add(1, unit).format('YYYY-MM-DD');
    navigate(`/calendar/${newDate}`);
  };

  /* Format header title with full month name */
  const headerTitle = useMemo(() => {
    const base = formatDate(new Date(selectedDate), {
      day: false,
      time: false,
      noToday: true,
    });

    return base.replace(/\b\w{3}\b/, () => new Date(selectedDate).toLocaleString('en-IN', { month: 'long' }));
  }, [selectedDate]);

  return (
    <>
      <div className={styles.container}>
        <Button aria-label={t('previous', 'Previous')} kind="tertiary" onClick={handleSelectPrev} size="sm">
          {t('prev', 'Prev')}
        </Button>

        {/* Display formatted current period (month/week/day) */}
        <span className={styles.headerTitle}>{headerTitle}</span>

        <Button aria-label={t('next', 'Next')} kind="tertiary" onClick={handleSelectNext} size="sm">
          {t('next', 'Next')}
        </Button>
      </div>

      <div className={styles.workLoadCard}>
        {/* Render single day label for daily view, full week for others */}
        {mode === 'daily' ? (
          <div className={styles.dayWrapper}>
            <DaysOfWeekCard dayOfWeek={dayjs(selectedDate).format('ddd').toUpperCase()} />
          </div>
        ) : (
          DAYS_IN_WEEK.map((day) => <DaysOfWeekCard key={day} dayOfWeek={day} />)
        )}
      </div>
    </>
  );
};

export default MonthlyHeader;
