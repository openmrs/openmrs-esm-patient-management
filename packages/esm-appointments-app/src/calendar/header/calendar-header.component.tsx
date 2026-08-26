import React, { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { type CalendarViewMode } from '../../types';
import { getCalendarFormat } from '../calendar-utils';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  calendarSelectedDate: Dayjs;
  appointmentCount: number;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  calendarSelectedDate,
  appointmentCount,
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
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar,
    }).format(new Date(isoDate + 'T00:00:00'));
  }, [viewMode, calendarSelectedDate, locale, calendar]);

  const countLabel = useMemo(() => {
    if (viewMode === 'daily') {
      return appointmentCount === 1
        ? t('appointmentCountSingular', '{{count}} appointment', { count: appointmentCount })
        : t('appointmentCountPlural', '{{count}} appointments', { count: appointmentCount });
    }
    return t('appointmentsThisMonth', '{{count}} appointments this month', { count: appointmentCount });
  }, [viewMode, appointmentCount, t]);

  const viewModeIndex = viewMode === 'monthly' ? 0 : 1;
  const VIEW_MODES: CalendarViewMode[] = ['monthly', 'daily'];

  return (
    <div className={styles.calendarHeaderContainer}>
      <button type="button" className={styles.todayButton} onClick={onToday}>
        {t('today', 'Today')}
      </button>
      <div className={styles.navButtonGroup}>
        <button type="button" aria-label={t('previous', 'Previous')} className={styles.navButton} onClick={onPrev}>
          ‹
        </button>
        <button
          type="button"
          aria-label={t('next', 'Next')}
          className={`${styles.navButton} ${styles.navButtonLast}`}
          onClick={onNext}>
          ›
        </button>
      </div>
      <span className={styles.dateLabel}>{dateLabel}</span>
      <span className={styles.countLabel}>{countLabel}</span>
      <div className={styles.switcherSection}>
        <ContentSwitcher
          selectedIndex={viewModeIndex}
          size="sm"
          onChange={({ index }) => onViewModeChange(VIEW_MODES[index as number])}>
          <Switch name="monthly" text={t('monthly', 'Monthly')} />
          <Switch name="daily" text={t('daily', 'Daily')} />
        </ContentSwitcher>
      </div>
    </div>
  );
};

export default CalendarHeader;
