import React, { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';
import { parseDate, startOfWeek } from '@internationalized/date';
import { type CalendarViewMode } from '../../types';
import { getCalendarFormat } from '../calendar-utils';
import styles from './calendar-header.scss';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  calendarSelectedDate: Dayjs;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  calendarSelectedDate,
  onViewModeChange,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslation();
  const { locale, calendar } = getCalendarFormat();

  const dateLabel = useMemo(() => {
    const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
    const gregDate = parseDate(isoDate);

    if (viewMode === 'monthly') {
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', calendar }).format(
        new Date(isoDate + 'T00:00:00'),
      );
    }
    if (viewMode === 'weekly') {
      const firstDay = calendar === 'persian' ? 'sat' : 'sun';
      const ws = startOfWeek(gregDate, locale, firstDay);
      const we = ws.add({ days: 6 });
      return `${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', calendar }).format(new Date(ws.toString() + 'T00:00:00'))} – ${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric', calendar }).format(new Date(we.toString() + 'T00:00:00'))}`;
    }
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', calendar }).format(
      new Date(isoDate + 'T00:00:00'),
    );
  }, [viewMode, calendarSelectedDate, locale, calendar]);

  const viewModeIndex = viewMode === 'monthly' ? 0 : viewMode === 'weekly' ? 1 : 2;
  const VIEW_MODES: CalendarViewMode[] = ['monthly', 'weekly', 'daily'];

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.navigationSection}>
        <div className={styles.navGroup}>
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
        </div>
      </div>
      <div className={styles.switcherSection}>
        <ContentSwitcher
          selectedIndex={viewModeIndex}
          size="sm"
          onChange={({ index }) => onViewModeChange(VIEW_MODES[index as number])}>
          <Switch name="monthly" text={t('monthly', 'Monthly')} />
          <Switch name="weekly" text={t('weekly', 'Weekly')} />
          <Switch name="daily" text={t('daily', 'Daily')} />
        </ContentSwitcher>
      </div>
    </div>
  );
};

export default CalendarHeader;
