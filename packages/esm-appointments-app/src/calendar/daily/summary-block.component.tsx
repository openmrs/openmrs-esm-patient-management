import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type HourSlot } from '../utils/day-timeline';
import { getServiceColor } from '../utils/calendar-colors';
import styles from './summary-block.scss';

interface SummaryBlockProps {
  slot: HourSlot;
  onOpenTable: () => void;
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({ slot, onOpenTable }) => {
  const { t } = useTranslation();

  const groups = useMemo(() => {
    const byService = new Map<string, number>();
    slot.blocks.forEach(({ appointment }) => {
      byService.set(appointment.service.name, (byService.get(appointment.service.name) ?? 0) + 1);
    });
    return [...byService.entries()]
      .map(([name, count]) => ({ name, count, color: getServiceColor(name) }))
      .sort((a, b) => b.count - a.count);
  }, [slot.blocks]);

  return (
    <div className={styles.summary} data-testid="summary-block">
      <div className={styles.count}>
        {t('appointmentCount', '{{count}} appointments', { count: slot.blocks.length })}
      </div>
      <div className={styles.peak}>
        {t(
          'overLegibleLimit',
          '{{peak}} overlap at once — over the legible limit. Narrow it down or open the full list.',
          {
            peak: slot.peak,
          },
        )}
      </div>
      <div className={styles.services}>
        {groups.map((group) => (
          <span key={group.name} className={styles.servicePill}>
            <span className={styles.serviceDot} style={{ background: group.color }} />
            {group.name} {group.count}
          </span>
        ))}
      </div>
      <button type="button" className={styles.openTable} onClick={onOpenTable}>
        {t('openInTable', 'Open in table')} →
      </button>
    </div>
  );
};

export default SummaryBlock;
