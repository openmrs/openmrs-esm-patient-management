import React from 'react';
import { useTranslation } from 'react-i18next';
import { type PositionedBlock, formatTimeRange, ONE_LINE_HEIGHT_THRESHOLD_PX, hexToRgba } from '../utils/day-timeline';
import { getFallbackServiceColor } from '../utils/calendar-colors';
import styles from './appointment-block.scss';

interface AppointmentBlockProps {
  block: PositionedBlock;
  onClick: () => void;
  serviceColorMap?: Map<string, string>;
}

const AppointmentBlock: React.FC<AppointmentBlockProps> = ({ block, onClick, serviceColorMap }) => {
  const { t } = useTranslation();
  const { appointment, lane, lanes, topPx, heightPx } = block;
  const color = serviceColorMap?.get(appointment.service.uuid) ?? getFallbackServiceColor(appointment.service.uuid);
  const provider = appointment.providers?.[0]?.display ?? appointment.providers?.[0]?.name ?? '—';
  const timeRange = formatTimeRange(block.s, block.e);
  const oneLine = heightPx < ONE_LINE_HEIGHT_THRESHOLD_PX;
  const patientName = appointment.patient?.name ?? '—';
  const statusLabel = appointment.status ? t(appointment.status, appointment.status) : '';

  return (
    <button
      type="button"
      aria-label={`${patientName} — ${timeRange} · ${provider} · ${statusLabel}`}
      title={`${patientName} — ${timeRange} · ${provider} · ${statusLabel}`}
      onClick={onClick}
      className={`${styles.block} ${oneLine ? styles.oneLine : ''}`}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        left: `${(lane / lanes) * 100}%`,
        width: `${100 / lanes}%`,
        borderLeftColor: color,
        backgroundColor: hexToRgba(color, 0.13),
      }}>
      {oneLine ? (
        <span className={styles.oneLineText}>
          <strong>{patientName}</strong>&nbsp;&nbsp;{timeRange} · {provider}
        </span>
      ) : (
        <>
          <span className={styles.patient}>{patientName}</span>
          <span className={styles.meta}>
            {timeRange} · {provider}
          </span>
        </>
      )}
    </button>
  );
};

export default React.memo(AppointmentBlock);
