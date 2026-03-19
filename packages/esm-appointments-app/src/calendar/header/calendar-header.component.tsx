import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaHomePage } from '../../constants';
import { CALENDAR_SYSTEMS, type CalendarSystem, type CalendarDate, getWeekDays } from '../calendar-systems';
import styles from './calendar-header.scss';

export type CalendarViewMode = 'monthly' | 'weekly' | 'daily';

interface CalendarHeaderProps {
  /** Currently active view */
  viewMode: CalendarViewMode;
  /** Active calendar system object */
  calendarSystem: CalendarSystem;
  /** Current navigation date in the active calendar system */
  navDate: CalendarDate;
  /** Called when the user changes the view mode */
  onViewModeChange: (mode: CalendarViewMode) => void;
  /** Called when the user changes the calendar system key */
  onCalendarSystemChange: (key: string) => void;
  /** Called when the user navigates backward */
  onPrev: () => void;
  /** Called when the user navigates forward */
  onNext: () => void;
}

/**
 * CalendarHeader
 *
 * Renders:
 *  - A Back button to return to the appointments list
 *  - Prev / Next navigation arrows with a centred title label
 *  - A segmented view-mode toggle (Monthly / Weekly / Daily)
 *  - A calendar-system selector (Gregorian / Ethiopic / Islamic / Persian)
 */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  calendarSystem,
  navDate,
  onViewModeChange,
  onCalendarSystemChange,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslation();

  const handleBackClick = useCallback(() => {
    navigate({ to: `${spaHomePage}/appointments/${dayjs().format('YYYY-MM-DD')}` });
  }, []);

  /** Human-readable label shown between Prev / Next buttons */
  const titleLabel = useMemo(() => {
    const { year, month, day } = navDate;
    const monthName = calendarSystem.months[month] ?? `Month ${month + 1}`;

    if (viewMode === 'monthly') {
      return `${monthName} ${year}`;
    }

    if (viewMode === 'weekly') {
      const weekDays = getWeekDays(calendarSystem.key, year, month, day);
      const first = weekDays[0];
      const last = weekDays[6];
      const fm = calendarSystem.months[first.month] ?? `M${first.month + 1}`;
      const lm = calendarSystem.months[last.month] ?? `M${last.month + 1}`;
      if (first.month === last.month) {
        return `${fm} ${first.day}–${last.day}, ${first.year}`;
      }
      return `${fm} ${first.day} – ${lm} ${last.day}, ${last.year}`;
    }

    // daily
    return `${monthName} ${day}, ${year}`;
  }, [viewMode, navDate, calendarSystem]);

  const VIEW_MODES: Array<{ key: CalendarViewMode; label: string }> = [
    { key: 'monthly', label: t('monthly', 'Monthly') },
    { key: 'weekly', label: t('weekly', 'Weekly') },
    { key: 'daily', label: t('daily', 'Daily') },
  ];

  return (
    <div className={styles.calendarHeaderContainer}>
      {/* ── Left: back + nav ── */}
      <div className={styles.leftGroup}>
        <Button
          className={styles.backButton}
          iconDescription={t('back', 'Back')}
          kind="ghost"
          onClick={handleBackClick}
          renderIcon={ArrowLeft}
          size="sm">
          <span>{t('back', 'Back')}</span>
        </Button>

        <div className={styles.navGroup}>
          <button className={styles.navButton} onClick={onPrev} aria-label={t('previous', 'Previous')}>
            ←
          </button>
          <span className={styles.titleLabel}>{titleLabel}</span>
          <button className={styles.navButton} onClick={onNext} aria-label={t('next', 'Next')}>
            →
          </button>
        </div>
      </div>

      {/* ── Right: view toggle + calendar selector ── */}
      <div className={styles.rightGroup}>
        {/* Calendar system selector */}
        <select
          className={styles.calendarSelect}
          value={calendarSystem.key}
          onChange={(e) => onCalendarSystemChange(e.target.value)}
          aria-label={t('calendarSystem', 'Calendar system')}>
          {Object.values(CALENDAR_SYSTEMS).map((cs) => (
            <option key={cs.key} value={cs.key}>
              {cs.label}
            </option>
          ))}
        </select>

        {/* View mode segmented toggle */}
        <div className={styles.viewToggle} role="group" aria-label={t('viewMode', 'View mode')}>
          {VIEW_MODES.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.viewToggleButton} ${viewMode === key ? styles.viewToggleButtonActive : ''}`}
              onClick={() => onViewModeChange(key)}
              aria-pressed={viewMode === key}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
