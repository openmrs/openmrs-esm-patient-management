import React, { useMemo } from 'react';
import { type Appointment } from './../../types';
import { formatAMPM } from './../../helpers/functions';
import styles from './weekly-calendar-view.scss';

interface WeeklySlotCellProps {
  appointments: ReadonlyArray<Appointment>;
  isoDate: string;
  startHour: number;
  endHour: number;
  isToday: boolean;
  onSelectDate: (isoDate: string, startHour: number, endHour: number) => void;
}

const WeeklySlotCell: React.FC<WeeklySlotCellProps> = ({
  appointments,
  isoDate,
  startHour,
  endHour,
  isToday,
  onSelectDate,
}) => {
  const blockAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (a.startDateTime == null) return false;
        const h = new Date(a.startDateTime).getHours();
        return h >= startHour && h < endHour;
      })
      .sort((a, b) => {
        if (a.startDateTime == null || b.startDateTime == null) return 0;
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      });
  }, [appointments, startHour, endHour]);

  const total = blockAppointments.length;
  const hasAppts = total > 0;

  if (!hasAppts) {
    return <div data-testid="slot-cell" className={`${styles.slotCell} ${isToday ? styles.slotCellToday : ''}`} />;
  }

  const visible = blockAppointments.slice(0, 2);
  const overflow = total - 2;

  return (
    <div
      data-testid="slot-cell"
      className={`${styles.slotCell} ${isToday ? styles.slotCellToday : ''} ${styles.slotCellHasAppts}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelectDate(isoDate, startHour, endHour)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectDate(isoDate, startHour, endHour);
        }
      }}>
      <div className={styles.previewList}>
        {visible.map((a) => {
          const time = a.startDateTime != null ? formatAMPM(new Date(a.startDateTime)) : '—';
          const name = a.patient?.name ?? '—';
          return (
            <div key={a.uuid} className={styles.previewRow}>
              <span className={styles.previewTime}>{time}</span>
              <span className={styles.previewName} title={name}>
                {name}
              </span>
            </div>
          );
        })}
        {overflow > 0 && (
          <button
            type="button"
            className={styles.moreLink}
            onClick={(e) => {
              e.stopPropagation();
              onSelectDate(isoDate, startHour, endHour);
            }}>
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
};

export default WeeklySlotCell;
