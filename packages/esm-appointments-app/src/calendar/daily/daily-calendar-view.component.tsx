import React, { useMemo, useState, useCallback } from 'react';
import { Tag, InlineLoading } from '@carbon/react';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatAMPM } from '../../helpers/functions';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { STATUS_TAG_TYPES, DEFAULT_STATUS_TAG_TYPE, CALENDAR_HOURS, formatHourLabel } from '../utils/calendar-colors';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  calendarSelectedDate: Dayjs;
  serviceColorMap?: Map<string, string>;
}

type TimelineSegment =
  | { type: 'occupied'; hour: number; appointments: Array<Appointment> }
  | { type: 'empty-range'; startHour: number; endHour: number; hours: Array<number> };

function formatRangeLabel(startHr: number, endHr: number): string {
  const formatHr = (h: number) => {
    const adjusted = h % 24;
    const hourNum = adjusted % 12 || 12;
    const period = adjusted < 12 ? 'AM' : 'PM';
    return `${hourNum} ${period}`;
  };
  return `${formatHr(startHr)} – ${formatHr(endHr)}`;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calendarSelectedDate, serviceColorMap }) => {
  const { t } = useTranslation();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());

  const toggleRange = useCallback((rangeKey: string) => {
    setExpandedRanges((prev) => {
      const next = new Set(prev);
      if (next.has(rangeKey)) {
        next.delete(rangeKey);
      } else {
        next.add(rangeKey);
      }
      return next;
    });
  }, []);

  const hourMap = useMemo(() => {
    const map = new Map<number, Array<Appointment>>();
    CALENDAR_HOURS.forEach((h) => map.set(h, []));

    appointments.forEach((appt) => {
      if (appt.startDateTime != null) {
        const hour = new Date(appt.startDateTime).getHours();
        if (map.has(hour)) {
          map.get(hour)!.push(appt);
        }
      }
    });

    return map;
  }, [appointments]);

  const segments = useMemo(() => {
    const result: Array<TimelineSegment> = [];
    let emptyStreak: Array<number> = [];

    const flushEmptyStreak = () => {
      if (emptyStreak.length > 0) {
        const startHour = emptyStreak[0];
        const endHour = (emptyStreak[emptyStreak.length - 1] + 1) % 24;
        result.push({
          type: 'empty-range',
          startHour,
          endHour: emptyStreak[emptyStreak.length - 1] === 23 ? 24 : endHour,
          hours: [...emptyStreak],
        });
        emptyStreak = [];
      }
    };

    CALENDAR_HOURS.forEach((hr) => {
      const appts = hourMap.get(hr) || [];
      if (appts.length > 0) {
        flushEmptyStreak();
        result.push({ type: 'occupied', hour: hr, appointments: appts });
      } else {
        emptyStreak.push(hr);
      }
    });

    flushEmptyStreak();
    return result;
  }, [hourMap]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="daily-calendar-view">
      <div className={styles.heading}>
        <p className={styles.subtitle}>
          {appointments.length === 0
            ? t('noAppointments', 'No appointments scheduled')
            : t('appointmentCount', '{{count}} appointment(s)', { count: appointments.length })}
        </p>
      </div>

      {appointments.length > 0 &&
        segments.map((segment) => {
          if (segment.type === 'occupied') {
            return (
              <div key={`hour-${segment.hour}`} className={styles.hourRow} data-testid={`hour-row-${segment.hour}`}>
                <div className={styles.hourLabel}>{formatHourLabel(segment.hour)}</div>
                <div className={styles.hourSlot}>
                  {segment.appointments.map((a) => (
                    <DailyCard key={a.uuid} appointment={a} serviceColorMap={serviceColorMap} />
                  ))}
                </div>
              </div>
            );
          }

          const rangeKey = `${segment.startHour}-${segment.endHour}`;
          const isExpanded = expandedRanges.has(rangeKey);
          const rangeLabel = formatRangeLabel(segment.startHour, segment.endHour);

          return (
            <React.Fragment key={`range-${rangeKey}`}>
              <div className={styles.collapsedRangeRow} data-testid={`collapsed-range-${rangeKey}`}>
                <div className={styles.collapsedRangeLeft}>
                  <span className={styles.collapsedRangeLabel}>{rangeLabel}</span>
                  <span className={styles.noApptsBadge}>{t('noAppointments', 'No appointments scheduled')}</span>
                </div>
                <button
                  type="button"
                  className={styles.expandToggleBtn}
                  onClick={() => toggleRange(rangeKey)}
                  aria-expanded={isExpanded}>
                  {isExpanded ? `▴ ${t('collapse', 'Collapse')}` : `▾ ${t('expand', 'Expand')}`}
                </button>
              </div>

              {isExpanded &&
                segment.hours.map((emptyHr) => (
                  <div key={`empty-hr-${emptyHr}`} className={`${styles.hourRow} ${styles.emptyHourRow}`}>
                    <div className={styles.hourLabel}>{formatHourLabel(emptyHr)}</div>
                    <div className={styles.hourSlot} />
                  </div>
                ))}
            </React.Fragment>
          );
        })}
    </div>
  );
};

interface DailyCardProps {
  appointment: Appointment;
  serviceColorMap?: Map<string, string>;
}

const DailyCard: React.FC<DailyCardProps> = ({ appointment, serviceColorMap }) => {
  const serviceColor = (appointment.service?.uuid && serviceColorMap?.get(appointment.service.uuid)) || '#0f62fe';
  const tagType = STATUS_TAG_TYPES[appointment.status] ?? DEFAULT_STATUS_TAG_TYPE;

  const startTime = useMemo(() => {
    if (!appointment.startDateTime) return '—';
    return formatAMPM(new Date(appointment.startDateTime));
  }, [appointment.startDateTime]);

  const endTime = useMemo(() => {
    if (!appointment.endDateTime) return '';
    return ` – ${formatAMPM(new Date(appointment.endDateTime))}`;
  }, [appointment.endDateTime]);

  const providerName =
    appointment.providers?.[0]?.name || appointment.provider?.display || appointment.provider?.name || '';
  const serviceName = appointment.service?.name;

  return (
    <div
      className={styles.card}
      data-testid={`appointment-card-${appointment.uuid}`}
      style={{
        borderLeftColor: serviceColor,
        backgroundColor: `${serviceColor}18`,
      }}>
      <div className={styles.cardHeader}>
        <div className={styles.cardPatientName}>{appointment.patient?.name ?? '—'}</div>
        {appointment.status && (
          <Tag type={tagType} size="sm">
            {appointment.status}
          </Tag>
        )}
      </div>

      <div className={styles.cardMeta}>
        <span className={styles.cardTime}>
          <span>{startTime}</span>
          {appointment.endDateTime && <span>{endTime}</span>}
        </span>
        {serviceName && (
          <span className={styles.cardService} style={{ color: serviceColor }}>
            {serviceName}
          </span>
        )}
        {providerName && <span className={styles.cardProvider}>{` · ${providerName}`}</span>}
      </div>
    </div>
  );
};

export default DailyCalendarView;
