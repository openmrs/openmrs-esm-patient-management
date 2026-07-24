import React, { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { ChevronLeft, ChevronRight } from '@carbon/react/icons';
import { parseDate, startOfWeek } from '@internationalized/date';
import { LOCALE_MAP, deriveCalKey } from '../calendar-utils';
import styles from './calendar-header.scss';

export type CalendarViewMode = 'monthly' | 'weekly' | 'daily';

interface CalendarHeaderProps {
  viewMode?: CalendarViewMode;
  calendarSelectedDate?: Dayjs;
  onViewModeChange?: (mode: CalendarViewMode) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode = 'monthly',
  calendarSelectedDate = dayjs(),
  onViewModeChange = () => {},
  onPrev = () => {},
  onNext = () => {},
}) => {
  const { t } = useTranslation();
  const calKey = deriveCalKey();
  const locale = LOCALE_MAP[calKey] ?? 'en-US';

  const titleLabel = useMemo(() => {
    const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
    const gregDate = parseDate(isoDate);

    if (viewMode === 'monthly') {
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', calendar: calKey }).format(
        new Date(isoDate + 'T00:00:00'),
      );
    }
    if (viewMode === 'weekly') {
      const ws = startOfWeek(gregDate, 'en-US', 'sun');
      const we = ws.add({ days: 6 });
      return `${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', calendar: calKey }).format(new Date(ws.toString() + 'T00:00:00'))} – ${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric', calendar: calKey }).format(new Date(we.toString() + 'T00:00:00'))}`;
    }
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', calendar: calKey }).format(
      new Date(isoDate + 'T00:00:00'),
    );
  }, [viewMode, calendarSelectedDate, locale, calKey]);

  const viewModeIndex = viewMode === 'monthly' ? 0 : viewMode === 'weekly' ? 1 : 2;
  const VIEW_MODES: CalendarViewMode[] = ['monthly', 'weekly', 'daily'];

  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.leftGroup}>
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
          <span className={styles.titleLabel}>{titleLabel}</span>
        </div>
      </div>
      <div className={styles.rightGroup}>
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
