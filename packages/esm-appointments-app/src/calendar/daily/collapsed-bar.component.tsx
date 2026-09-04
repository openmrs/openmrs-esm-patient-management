import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import { type TimelineRange } from '../utils/day-timeline';
import { formatHourLabel } from '../utils/calendar-colors';
import styles from './collapsed-bar.scss';

interface CollapsedBarProps {
  range: TimelineRange;
  onToggle: () => void;
  /** When true, the range is expanded and the bar acts as a collapse control. */
  expanded?: boolean;
  /** Number of appointments in the range, shown in the bar. */
  count: number;
}

const CollapsedBar: React.FC<CollapsedBarProps> = ({ range, onToggle, expanded = false, count }) => {
  const { t } = useTranslation();
  const rangeLabel = `${formatHourLabel(range.h0)} – ${formatHourLabel((range.h1 + 1) % 24)}`;
  const countText = t('appointmentCount', '{{count}} appointment', {
    count,
    defaultValue_other: '{{count}} appointments',
  });
  const actionText = expanded ? t('collapse', 'Collapse') : t('expand', 'Expand');
  const Icon = expanded ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      className={styles.bar}
      aria-expanded={expanded}
      aria-label={`${rangeLabel}, ${countText}, ${actionText}`}
      onClick={onToggle}>
      <span aria-hidden="true" className={styles.rangeLabel}>
        {rangeLabel}
      </span>
      <span aria-hidden="true" className={styles.pill}>
        {countText}
      </span>
      <span aria-hidden="true" className={styles.toggle}>
        <Icon size={16} className={styles.toggleIcon} />
        {actionText}
      </span>
    </button>
  );
};

export default React.memo(CollapsedBar);
