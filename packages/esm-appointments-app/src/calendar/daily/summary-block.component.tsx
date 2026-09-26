import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { type HourSlot } from '../utils/day-timeline';
import { getFallbackServiceColor } from '../utils/calendar-colors';
import styles from './summary-block.scss';

interface SummaryBlockProps {
  slot: HourSlot;
  onOpenTable: () => void;
  serviceColorMap?: Map<string, string>;
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({ slot, onOpenTable, serviceColorMap }) => {
  const { t } = useTranslation();

  const { groups, totalCount } = useMemo(() => {
    const appts = slot.allAppointments?.length > 0 ? slot.allAppointments : slot.blocks.map((b) => b.appointment);
    const byService = new Map<string, { name: string; count: number }>();
    appts.forEach((appointment) => {
      const entry = byService.get(appointment.service.uuid) ?? {
        name: appointment.service.name,
        count: 0,
      };
      entry.count += 1;
      byService.set(appointment.service.uuid, entry);
    });
    const sortedGroups = [...byService.entries()]
      .map(([uuid, { name, count }]) => ({
        uuid,
        name,
        count,
        color: serviceColorMap?.get(uuid) ?? getFallbackServiceColor(uuid),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      groups: sortedGroups,
      totalCount: appts.length,
    };
  }, [slot.allAppointments, slot.blocks, serviceColorMap]);

  return (
    <div className={styles.summary} data-testid="summary-block">
      <div className={styles.count}>
        {t('appointmentCount', '{{count}} appointment', {
          count: totalCount,
          defaultValue_other: '{{count}} appointments',
        })}
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
          <span key={group.uuid} className={styles.servicePill}>
            <span className={styles.serviceDot} style={{ background: group.color }} />
            {group.name} {group.count}
          </span>
        ))}
      </div>
      <Button kind="ghost" size="sm" renderIcon={ArrowRight} className={styles.openTable} onClick={onOpenTable}>
        {t('openInTable', 'Open in table')}
      </Button>
    </div>
  );
};

export default React.memo(SummaryBlock);
