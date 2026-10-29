import React, { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';
import { type CalendarViewMode } from '../../types';
import { getCalendarFormat } from '../calendar-utils';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  calendarSelectedDate: Dayjs;
  appointmentsCount: number | null;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  calendarSelectedDate,
  appointmentsCount,
  onViewModeChange,
  onToday,
  onPrev,
  onNext,
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
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', calendar }).format(
      new Date(isoDate + 'T00:00:00'),
    );
  }, [viewMode, calendarSelectedDate, locale, calendar]);

  const appointmentsCountLabel = useMemo(() => {
    if (appointmentsCount === null) {
      return null;
    }
    if (viewMode === 'monthly') {
      return appointmentsCount === 1
        ? t('oneAppointmentThisMonth', '1 appointment this month')
        : t('appointmentsThisMonthCount', '{{total}} appointments this month', { total: appointmentsCount });
    }
    return appointmentsCount === 1
      ? t('oneAppointmentThisDay', '1 appointment this day')
      : t('appointmentsThisDayCount', '{{total}} appointments this day', { total: appointmentsCount });
  }, [appointmentsCount, viewMode, t]);

  const viewModeIndex = viewMode === 'monthly' ? 0 : 1;
  const VIEW_MODES: CalendarViewMode[] = ['monthly', 'daily'];

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.navigationSection}>
        <div className={styles.navGroup}>
          <Button kind="tertiary" size="sm" onClick={onToday}>
            {t('today', 'Today')}
          </Button>
          <div className={styles.navButtonGroup}>
            <Button
              hasIconOnly
              kind="ghost"
              size="sm"
              renderIcon={ChevronLeft}
              iconDescription={t('previous', 'Previous')}
              onClick={onPrev}
            />
            <span className={styles.navDivider} />
            <Button
              hasIconOnly
              kind="ghost"
              size="sm"
              renderIcon={ChevronRight}
              iconDescription={t('next', 'Next')}
              onClick={onNext}
            />
          </div>
          <span className={styles.dateLabel}>{dateLabel}</span>
          {appointmentsCountLabel !== null && (
            <span className={styles.appointmentsCount}>{appointmentsCountLabel}</span>
          )}
        </div>
      </div>
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
