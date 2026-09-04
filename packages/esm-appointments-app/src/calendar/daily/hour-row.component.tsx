import React from 'react';
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
  serviceColorMap?: Map<string, string>;
}

const HourRow: React.FC<HourRowProps> = ({ slot, onBlockClick, onOpenTable, serviceColorMap }) => {
  const hourLabel = formatHourLabel(slot.hour);
  const minHeightStyle = { minHeight: `${slot.minHeightPx}px` };

  return (
    <div
      className={styles.row}
      data-testid={`hour-row-${slot.hour}`}
      role="listitem"
      aria-label={hourLabel}
      style={minHeightStyle}>
      <div className={styles.hourLabel} style={minHeightStyle}>
        {hourLabel}
      </div>
      <div className={styles.slot} style={minHeightStyle}>
        {slot.exceedsCeiling ? (
          <SummaryBlock slot={slot} onOpenTable={() => onOpenTable(slot.hour)} serviceColorMap={serviceColorMap} />
        ) : slot.blocks.length > 0 ? (
          slot.blocks.map((block) => (
            <AppointmentBlock
              key={block.appointment.uuid}
              block={block}
              onClick={() => onBlockClick(block.appointment)}
              serviceColorMap={serviceColorMap}
            />
          ))
        ) : (
          <div className={styles.empty} />
        )}
      </div>
    </div>
  );
};

export default React.memo(HourRow);
