import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Tag, InlineLoading, Button } from '@carbon/react';
import { Close, Launch } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { formatAMPM } from '../../helpers/functions';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { STATUS_TAG_TYPES, DEFAULT_STATUS_TAG_TYPE, getServiceColor } from '../utils/calendar-colors';
import styles from './day-appointments-modal.scss';

const LOCALE_MAP: Record<string, string> = {
  gregory: 'en-US',
  ethiopic: 'am-ET',
  islamic: 'ar-SA',
  persian: 'fa-IR',
};

interface DayAppointmentsModalProps {
  isoDate: string;
  calKey: string;
  onClose: () => void;
  onDrillDown: (mode: 'daily', isoDate: string) => void;
}

const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({ isoDate, calKey, onClose, onDrillDown }) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('All');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);
  const locale = LOCALE_MAP[calKey] ?? 'en-US';

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const displayDate = useMemo(() => {
    const d = new Date(isoDate + 'T00:00:00');
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: calKey,
    }).format(d);
  }, [isoDate, locale, calKey]);

  const statuses = useMemo(() => ['All', ...Array.from(new Set(appointments.map((a) => a.status)))], [appointments]);

  useEffect(() => {
    if (statusFilter !== 'All' && !statuses.includes(statusFilter)) {
      setStatusFilter('All');
    }
  }, [statuses, statusFilter]);

  const filtered = useMemo(
    () => (statusFilter === 'All' ? appointments : appointments.filter((a) => a.status === statusFilter)),
    [appointments, statusFilter],
  );

  const byService = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    filtered.forEach((a) => {
      const k = a.service?.name ?? t('unknownService', 'Unknown Service');
      map.set(k, [...(map.get(k) ?? []), a]);
    });
    return Array.from(map.entries());
  }, [filtered, t]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <p className={styles.headerLabel}>{t('appointments', 'Appointments')}</p>
            <h2 className={styles.headerTitle}>{displayDate}</h2>
            <p className={styles.headerSub}>
              {appointments.length} {t('appointmentsTotal', 'total')}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button kind="ghost" size="sm" renderIcon={Launch} onClick={() => onDrillDown('daily', isoDate)}>
              {t('dayView', 'Day View')}
            </Button>
            <Button
              hasIconOnly
              kind="ghost"
              size="sm"
              renderIcon={Close}
              iconDescription={t('close', 'Close')}
              onClick={onClose}
            />
          </div>
        </div>

        {!isLoading && appointments.length > 0 && (
          <div className={styles.filters}>
            {statuses.map((s) => {
              const ttype = s === 'All' ? 'gray' : (STATUS_TAG_TYPES[s] ?? DEFAULT_STATUS_TAG_TYPE);
              const count = s === 'All' ? appointments.length : appointments.filter((a) => a.status === s).length;
              return (
                <Tag
                  key={s}
                  type={statusFilter === s ? ttype : 'gray'}
                  tabIndex={0}
                  onClick={() => setStatusFilter(s)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setStatusFilter(s);
                    }
                  }}
                  className={`${styles.filterChip} ${statusFilter === s ? styles.filterChipActive : ''}`}>
                  {s} ({count})
                </Tag>
              );
            })}
          </div>
        )}

        <div className={styles.body}>
          {isLoading ? (
            <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>{t('noAppointmentsFound', 'No appointments found')}</p>
          ) : (
            byService.map(([svcName, appts]) => (
              <div key={svcName} className={styles.serviceGroup}>
                <div className={styles.serviceHeader} style={{ borderBottomColor: `${getServiceColor(svcName)}40` }}>
                  <span className={styles.serviceDot} style={{ background: getServiceColor(svcName) }} />
                  <span className={styles.serviceName}>{svcName}</span>
                  <span
                    className={styles.serviceCount}
                    style={{ background: `${getServiceColor(svcName)}18`, color: getServiceColor(svcName) }}>
                    {appts.length}
                  </span>
                </div>
                {appts.map((a) => {
                  const time = a.startDateTime != null ? formatAMPM(new Date(a.startDateTime)) : '—';
                  return (
                    <div key={a.uuid} className={styles.apptRow}>
                      <span className={styles.apptTime}>{time}</span>
                      <span className={styles.apptName}>{a.patient?.name ?? '—'}</span>
                      <Tag type={STATUS_TAG_TYPES[a.status] ?? DEFAULT_STATUS_TAG_TYPE} size="sm">
                        {a.status}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DayAppointmentsModal;
