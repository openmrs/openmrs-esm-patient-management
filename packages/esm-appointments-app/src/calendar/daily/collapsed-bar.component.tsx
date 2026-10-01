import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import { type TimelineRange } from '../utils/day-timeline';
import { formatHourLabel } from '../utils/calendar-colors';
import styles from './collapsed-bar.scss';

export type RangeDisplayState = 'normal' | 'expanded' | 'collapsed';

interface CollapsedBarProps {
  range: TimelineRange;
  onToggle: () => void;
  state?: RangeDisplayState;
  expanded?: boolean;
  count: number;
  locale?: string;
}

const CollapsedBar: React.FC<CollapsedBarProps> = ({
  range,
  onToggle,
  state,
  expanded = false,
  count,
  locale = 'en',
}) => {
  const { t } = useTranslation();
  const rangeLabel = `${formatHourLabel(range.h0, locale)} – ${formatHourLabel((range.h1 + 1) % 24, locale)}`;
  const countText = t('appointmentCount', '{{count}} appointment', {
    count,
    defaultValue_other: '{{count}} appointments',
  });

  const resolvedState: RangeDisplayState = state ?? (expanded ? 'expanded' : 'collapsed');

  const isVisible = resolvedState !== 'collapsed';
  const actionText = isVisible ? t('collapse', 'Collapse') : t('expand', 'Expand');
  const Icon = isVisible ? ChevronUp : ChevronDown;

  const isAriaExpanded = resolvedState !== 'collapsed';

  return (
    <button
      type="button"
      className={styles.bar}
      aria-expanded={isAriaExpanded}
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
