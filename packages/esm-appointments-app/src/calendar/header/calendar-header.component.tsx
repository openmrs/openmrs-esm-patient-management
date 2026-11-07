import React, { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';
import { type CalendarViewMode } from '../../types';
import { getCalendarFormat } from '../calendar-utils';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  calendarSelectedDate: Dayjs;
  appointmentCount?: number;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  calendarSelectedDate,
  appointmentCount = 0,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
}) => {
  const { t } = useTranslation();
  const { locale, calendar } = getCalendarFormat();

  const dateLabel = useMemo(() => {
    const isoDate = calendarSelectedDate.format('YYYY-MM-DD');

    if (viewMode === 'monthly') {
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', calendar }).format(
        new Date(isoDate + 'T00:00:00'),
      );
    }

    if (viewMode === 'weekly') {
      const startOfWeek = calendarSelectedDate.startOf('week');
      const endOfWeek = calendarSelectedDate.endOf('week');
      const startMonth = new Intl.DateTimeFormat(locale, { month: 'short', calendar }).format(startOfWeek.toDate());
      const endMonth = new Intl.DateTimeFormat(locale, { month: 'short', calendar }).format(endOfWeek.toDate());
      const startYear = startOfWeek.year();
      const endYear = endOfWeek.year();

      if (startYear !== endYear) {
        return `${startMonth} ${startOfWeek.date()}, ${startYear} – ${endMonth} ${endOfWeek.date()}, ${endYear}`;
      }
      if (startMonth !== endMonth) {
        return `${startMonth} ${startOfWeek.date()} – ${endMonth} ${endOfWeek.date()}, ${endYear}`;
      }
      return `${startMonth} ${startOfWeek.date()} – ${endOfWeek.date()}, ${endYear}`;
    }

    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', calendar }).format(
      new Date(isoDate + 'T00:00:00'),
    );
  }, [viewMode, calendarSelectedDate, locale, calendar]);

  const appointmentCountLabel = useMemo(() => {
    const count = appointmentCount ?? 0;
    const isToday = calendarSelectedDate.isSame(dayjs(), 'day');

    if (viewMode === 'monthly') {
      return count === 1
        ? t('appointmentsCountThisMonth_one', '1 appointment this month')
        : t('appointmentsCountThisMonth', '{{count}} appointments this month', { count });
    }

    if (viewMode === 'weekly') {
      return count === 1
        ? t('appointmentsCountThisWeek_one', '1 appointment this week')
        : t('appointmentsCountThisWeek', '{{count}} appointments this week', { count });
    }

    if (isToday) {
      return count === 1
        ? t('appointmentsCountToday_one', '1 appointment today')
        : t('appointmentsCountToday', '{{count}} appointments today', { count });
    }

    return count === 1
      ? t('appointmentsCountOnThisDay_one', '1 appointment on this day')
      : t('appointmentsCountOnThisDay', '{{count}} appointments on this day', { count });
  }, [appointmentCount, calendarSelectedDate, viewMode, t]);

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.navigationSection}>
        {onToday && (
          <button type="button" className={styles.todayButton} onClick={onToday}>
            {t('today', 'Today')}
          </button>
        )}
        <div className={styles.navButtonGroup}>
          <button
            type="button"
            className={classNames(styles.navButton, styles.navButtonPrev)}
            aria-label={t('previous', 'Previous')}
            onClick={onPrev}>
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className={classNames(styles.navButton, styles.navButtonNext)}
            aria-label={t('next', 'Next')}
            onClick={onNext}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className={styles.titleCountGroup}>
          <span className={styles.dateLabel}>{dateLabel}</span>
          <span className={styles.appointmentCount}>{appointmentCountLabel}</span>
        </div>
      </div>
      <div className={styles.switcherSection} role="tablist" aria-label={t('calendarViewModes', 'Calendar view modes')}>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'monthly'}
          className={classNames(styles.segmentedButton, {
            [styles.segmentedButtonSelected]: viewMode === 'monthly',
          })}
          onClick={() => onViewModeChange('monthly')}>
          {t('month', 'Month')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'weekly'}
          className={classNames(styles.segmentedButton, styles.segmentedButtonWithDivider, {
            [styles.segmentedButtonSelected]: viewMode === 'weekly',
          })}
          onClick={() => onViewModeChange('weekly')}>
          {t('week', 'Week')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'daily'}
          className={classNames(styles.segmentedButton, styles.segmentedButtonWithDivider, {
            [styles.segmentedButtonSelected]: viewMode === 'daily',
          })}
          onClick={() => onViewModeChange('daily')}>
          {t('day', 'Day')}
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
