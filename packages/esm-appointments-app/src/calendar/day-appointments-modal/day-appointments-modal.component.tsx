import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { type CalendarSystem, isoToCalendarDate } from '../calendar-systems';
import { STATUS_STYLES, DEFAULT_STATUS_STYLE, getServiceColor } from '../calendar-constants';
import styles from './day-appointments-modal.scss';

interface DayAppointmentsModalProps {
  /** ISO date string (YYYY-MM-DD) for the day to show */
  isoDate: string;
  /** The active calendar system (for displaying the date label) */
  calendarSystem: CalendarSystem;
  /** Called when the user closes the modal */
  onClose: () => void;
  /**
   * Called when the user clicks "Day View →".
   * Receives the view mode and the ISO date so the parent can switch views.
   */
  onDrillDown: (viewMode: 'daily', isoDate: string) => void;
}

/**
 * DayAppointmentsModal
 *
 * An in-context modal that shows all appointments for a selected day
 * without navigating away from the calendar.  Replaces the old navigate()
 * call in MonthlyWorkloadView.
 *
 * Features:
 *  - Real data via useAppointmentsByDate (SWR + OpenMRS REST)
 *  - Per-status filter chips
 *  - Grouped by appointment service
 *  - "Day View →" button drills down to the full DailyCalendarView
 *  - Closes on backdrop click or ESC key
 */
const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({
  isoDate,
  calendarSystem,
  onClose,
  onDrillDown,
}) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  // ── Close on ESC ──────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Build display date string in the active calendar system ───────────────
  const displayDate = useMemo(() => {
    const cal = isoToCalendarDate(calendarSystem.key, isoDate);
    const monthName = calendarSystem.months[cal.month] ?? `Month ${cal.month + 1}`;
    return `${monthName} ${cal.day}, ${cal.year}`;
  }, [calendarSystem, isoDate]);

  // ── Derive available statuses ─────────────────────────────────────────────
  const availableStatuses = useMemo(() => {
    const set = new Set(appointments.map((a) => a.status));
    return ['All', ...Array.from(set)];
  }, [appointments]);

  // ── Apply filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => (statusFilter === 'All' ? appointments : appointments.filter((a) => a.status === statusFilter)),
    [appointments, statusFilter],
  );

  // ── Group filtered appointments by service ────────────────────────────────
  const byService = useMemo(() => {
    const map = new Map<string, { name: string; appts: Array<Appointment> }>();
    filtered.forEach((appt) => {
      const svcName = appt.service?.name ?? t('unknownService', 'Unknown Service');
      if (!map.has(svcName)) {
        map.set(svcName, { name: svcName, appts: [] });
      }
      map.get(svcName)!.appts.push(appt);
    });
    return Array.from(map.values());
  }, [filtered, t]);

  // ── Stop propagation so clicks inside don't close the modal ──────────────
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContainer} onClick={handleContainerClick}>
        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <span className={styles.modalHeaderLabel}>{t('appointments', 'Appointments')}</span>
            <h2 className={styles.modalHeaderTitle}>{displayDate}</h2>
            <p className={styles.modalHeaderSubtitle}>
              {isLoading
                ? t('loading', 'Loading…')
                : t('appointmentCount', '{{count}} appointment(s)', { count: appointments.length })}
            </p>
          </div>

          <div className={styles.modalHeaderActions}>
            <button className={styles.drillDownButton} onClick={() => onDrillDown('daily', isoDate)}>
              {t('dayView', 'Day View')} →
            </button>
            <button className={styles.closeButton} aria-label={t('close', 'Close')} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* ── Status filter chips ── */}
        {!isLoading && appointments.length > 0 && (
          <div className={styles.filterBar}>
            {availableStatuses.map((status) => {
              const count =
                status === 'All' ? appointments.length : appointments.filter((a) => a.status === status).length;
              const sc = status === 'All' ? null : (STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE);
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  className={styles.filterChip}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    background: isActive ? (sc?.bg ?? '#e0f2fe') : '#f1f5f9',
                    color: isActive ? (sc?.text ?? '#0369a1') : '#64748b',
                  }}>
                  {status === 'All' ? t('all', 'All') : status} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* ── Body ── */}
        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loadingWrapper}>
              <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>{t('noAppointmentsFound', 'No appointments found')}</div>
          ) : (
            byService.map(({ name: svcName, appts }) => (
              <ServiceGroup key={svcName} serviceName={svcName} appointments={appts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Service group ─────────────────────────────────────────────────────────────

interface ServiceGroupProps {
  serviceName: string;
  appointments: Array<Appointment>;
}

const ServiceGroup: React.FC<ServiceGroupProps> = ({ serviceName, appointments }) => {
  const color = getServiceColor(serviceName);

  return (
    <div className={styles.serviceGroup}>
      <div className={styles.serviceGroupHeader} style={{ borderBottomColor: color + '40' }}>
        <span className={styles.serviceGroupDot} style={{ background: color }} />
        <span className={styles.serviceGroupName}>{serviceName}</span>
        <span className={styles.serviceGroupCount} style={{ background: color + '18', color }}>
          {appointments.length}
        </span>
      </div>

      {appointments.map((appt) => (
        <AppointmentRow key={appt.uuid} appointment={appt} />
      ))}
    </div>
  );
};

// ─── Appointment row ───────────────────────────────────────────────────────────

interface AppointmentRowProps {
  appointment: Appointment;
}

const AppointmentRow: React.FC<AppointmentRowProps> = ({ appointment }) => {
  const statusStyle = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;

  const startTime = useMemo(() => {
    const d = new Date(appointment.startDateTime);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }, [appointment.startDateTime]);

  return (
    <div className={styles.apptRow}>
      <span className={styles.apptRowTime}>{startTime}</span>
      <span className={styles.apptRowName}>{appointment.patient?.name ?? '—'}</span>
      <span className={styles.apptRowStatus} style={{ background: statusStyle.bg, color: statusStyle.text }}>
        {appointment.status}
      </span>
    </div>
  );
};

export default DayAppointmentsModal;
