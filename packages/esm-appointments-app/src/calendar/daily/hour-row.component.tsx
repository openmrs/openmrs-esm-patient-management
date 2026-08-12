import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Appointment } from '../../types';
import { type HourSlot } from '../utils/day-timeline';
import { formatHourLabel } from '../utils/calendar-colors';
import AppointmentBlock from './appointment-block.component';
import SummaryBlock from './summary-block.component';
import styles from './hour-row.scss';

interface HourRowProps {
  slot: HourSlot;
  onBlockClick: (appointment: Appointment) => void;
  onOpenTable: (hour: number) => void;
  /** Renders a small collapse control in the gutter (first row of an expanded range). */
  onCollapse?: () => void;
}

const HourRow: React.FC<HourRowProps> = ({ slot, onBlockClick, onOpenTable, onCollapse }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.row} data-testid={`hour-row-${slot.hour}`}>
      <div className={styles.hourLabel}>
        {formatHourLabel(slot.hour)}
        {onCollapse && (
          <button type="button" className={styles.collapse} aria-label={t('collapse', 'Collapse')} onClick={onCollapse}>
            ▴
          </button>
        )}
      </div>
      <div className={styles.slot}>
        {slot.exceedsCeiling ? (
          <SummaryBlock slot={slot} onOpenTable={() => onOpenTable(slot.hour)} />
        ) : slot.blocks.length > 0 ? (
          slot.blocks.map((block) => (
            <AppointmentBlock
              key={block.appointment.uuid}
              block={block}
              onClick={() => onBlockClick(block.appointment)}
            />
          ))
        ) : (
          <div className={styles.empty} />
        )}
      </div>
    </div>
  );
};

export default HourRow;
