import { Button } from '@carbon/react';
import { navigate } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { spaHomePage } from '../../constants';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from './weekly-header.scss';

// Same day labels as the monthly header
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const WeeklyHeader: React.FC = () => {
  const { t } = useTranslation();

  const selectedDate = useSelectedDate();

  const weekStart = dayjs(selectedDate).startOf('week');
  const weekEnd = dayjs(selectedDate).endOf('week');

  const goToPrevWeek = () => {
    navigate({
      to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).subtract(1, 'week').format('YYYY-MM-DD')}`,
    });
  };

  const goToNextWeek = () => {
    navigate({ to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).add(1, 'week').format('YYYY-MM-DD')}` });
  };

  return (
    <>
      {/* Prev / range label / Next — mirrors MonthlyHeader exactly */}
      <div className={styles.container}>
        <Button kind="tertiary" size="sm" onClick={goToPrevWeek} aria-label={t('previousWeek', 'Previous week')}>
          {t('prev', 'Prev')}
        </Button>
        <span>{`${weekStart.format('MMM D')} – ${weekEnd.format('MMM D, YYYY')}`}</span>
        <Button kind="tertiary" size="sm" onClick={goToNextWeek} aria-label={t('nextWeek', 'Next week')}>
          {t('next', 'Next')}
        </Button>
      </div>

      {/* Day-name row — same style as monthly header's workLoadCard */}
      <div className={styles.dayNames}>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className={styles.dayNameCell}>
            <span>{t(day, day)}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default WeeklyHeader;
