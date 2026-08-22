import React from 'react';
import { useTranslation } from 'react-i18next';
import { type TimelineRange } from '../utils/day-timeline';
import { formatHourLabel } from '../utils/calendar-colors';
import styles from './collapsed-bar.scss';

interface CollapsedBarProps {
  range: TimelineRange;
  onToggle: () => void;
}

const CollapsedBar: React.FC<CollapsedBarProps> = ({ range, onToggle }) => {
  const { t } = useTranslation();
  const rangeLabel = `${formatHourLabel(range.h0)} – ${formatHourLabel(range.h1 + 1)}`;

  return (
    <div
      className={styles.bar}
      role="button"
      aria-expanded={false}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}>
      <span className={styles.rangeLabel}>{rangeLabel}</span>
      <span className={styles.pill}>{t('noAppointments', 'No appointments')}</span>
      <span className={styles.toggle}>▾ Expand</span>
    </div>
  );
};

export default CollapsedBar;
