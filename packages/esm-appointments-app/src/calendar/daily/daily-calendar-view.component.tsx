import React, { useMemo, useState, useCallback } from 'react';
import {
  Tag,
  InlineLoading,
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { ArrowLeft, ArrowRight, Close } from '@carbon/react/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { formatAMPM } from '../../helpers/functions';
import { type Appointment, AppointmentStatus, AppointmentKind } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { STATUS_TAG_TYPES, DEFAULT_STATUS_TAG_TYPE, CALENDAR_HOURS, formatHourLabel } from '../utils/calendar-colors';
import styles from './daily-calendar-view.scss';

export interface DailyCalendarViewProps {
  calendarSelectedDate: Dayjs;
  serviceColorMap?: Map<string, string>;
}

type TimelineSegment =
  | { type: 'occupied'; hour: number; appointments: Array<Appointment> }
  | { type: 'empty-range'; startHour: number; endHour: number; hours: Array<number> };

type BasePatient = NonNullable<Appointment['patient']>;

export interface ExtendedPatient extends BasePatient {
  sex?: string;
  birthDate?: string;
  identifiers?: Array<{ identifier?: string; value?: string }>;
}

export type ExtendedAppointment = Omit<Appointment, 'patient' | 'provider' | 'appointmentType'> & {
  patient?: ExtendedPatient;
  dateTimeCreated?: string;
  provider?: { display?: string; name?: string };
  appointmentType?: { name?: string; display?: string };
  recurringPattern?: string;
  note?: string;
};

function formatRangeLabel(startHr: number, endHr: number): string {
  const startStr = formatHourLabel(startHr);
  const endStr = endHr === 24 ? '12 AM' : formatHourLabel(endHr % 24);
  return `${startStr} – ${endStr}`;
}

function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calendarSelectedDate, serviceColorMap }) => {
  const { t } = useTranslation();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());
  const [activeTableHour, setActiveTableHour] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

  const handleEdit = useCallback((appointment: Appointment) => {
    setSelectedAppointment(null);
    launchWorkspace2('appointments-form-workspace', {
      appointment,
      patientUuid: appointment.patient?.uuid,
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

    const existing3pm = map.get(15) || [];
    if (existing3pm.length < 5 && existing3pm.length > 0) {
      const base = existing3pm[0];
      const baseStart = base.startDateTime ?? new Date().getTime();
      const mockList: Array<unknown> = [
        {
          ...base,
          uuid: 'mock-1',
          startDateTime: dayjs(baseStart).minute(0).valueOf(),
          endDateTime: dayjs(baseStart).minute(30).valueOf(),
          patient: {
            name: 'Aria Adjei',
            uuid: 'pt-1',
            gender: 'Male',
            age: 66,
            birthDate: '1960-01-10',
            identifier: '500000Z',
          },
          service: {
            ...base.service,
            name: 'General Medicine',
            uuid: 'srv-1',
          },
          status: AppointmentStatus.SCHEDULED,
          providers: [{ name: 'Dr. John Mensah', uuid: 'pr-1' }],
          comments: 'High-volume load-test appointment.',
        },
        {
          ...base,
          uuid: 'mock-2',
          startDateTime: dayjs(baseStart).minute(2).valueOf(),
          endDateTime: dayjs(baseStart).minute(32).valueOf(),
          patient: {
            name: 'Noah Haddad',
            uuid: 'pt-2',
            gender: 'Male',
            age: 42,
            birthDate: '1984-05-14',
            identifier: '500001A',
          },
          service: {
            ...base.service,
            name: 'Outpatient Dept.',
            uuid: 'srv-2',
          },
          status: AppointmentStatus.CHECKEDIN,
          providers: [{ name: 'Dr. Ada Nwosu', uuid: 'pr-2' }],
          comments: 'Routine health checkup.',
        },
        {
          ...base,
          uuid: 'mock-3',
          startDateTime: dayjs(baseStart).minute(4).valueOf(),
          endDateTime: dayjs(baseStart).minute(34).valueOf(),
          patient: {
            name: 'Mia Owens',
            uuid: 'pt-3',
            gender: 'Female',
            age: 29,
            birthDate: '1997-09-22',
            identifier: '500002B',
          },
          service: {
            ...base.service,
            name: 'Rehabilitation',
            uuid: 'srv-3',
          },
          status: AppointmentStatus.COMPLETED,
          providers: [{ name: 'Dr. Sarah Bianchi', uuid: 'pr-3' }],
          comments: 'Physical therapy session.',
        },
        {
          ...base,
          uuid: 'mock-4',
          startDateTime: dayjs(baseStart).minute(6).valueOf(),
          endDateTime: dayjs(baseStart).minute(36).valueOf(),
          patient: {
            name: 'Leo Bello',
            uuid: 'pt-4',
            gender: 'Male',
            age: 51,
            birthDate: '1975-03-30',
            identifier: '500003C',
          },
          service: {
            ...base.service,
            name: 'Laboratory',
            uuid: 'srv-4',
          },
          status: AppointmentStatus.MISSED,
          providers: [{ name: 'Dr. Liam O’Brien', uuid: 'pr-4' }],
          comments: 'Fasting blood panel.',
        },
        {
          ...base,
          uuid: 'mock-5',
          startDateTime: dayjs(baseStart).minute(8).valueOf(),
          endDateTime: dayjs(baseStart).minute(38).valueOf(),
          patient: {
            name: 'Zara Ibrahim',
            uuid: 'pt-5',
            gender: 'Female',
            age: 35,
            birthDate: '1991-11-04',
            identifier: '500004D',
          },
          service: {
            ...base.service,
            name: 'General Medicine',
            uuid: 'srv-1',
          },
          status: AppointmentStatus.CANCELLED,
          providers: [{ name: 'Dr. John Mensah', uuid: 'pr-1' }],
          comments: 'Consultation rescheduled.',
        },
      ];
    }

    return map;
  }, [appointments]);

  const segments = useMemo(() => {
    const result: Array<TimelineSegment> = [];
    let emptyStreak: Array<number> = [];

    const flushEmptyStreak = () => {
      if (emptyStreak.length > 0) {
        const startHour = emptyStreak[0];
        const lastHour = emptyStreak[emptyStreak.length - 1];
        result.push({
          type: 'empty-range',
          startHour,
          endHour: lastHour === 23 ? 24 : lastHour + 1,
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

  if (activeTableHour !== null) {
    const tableAppointments = hourMap.get(activeTableHour) || [];
    const hourLabel = formatRangeLabel(activeTableHour, activeTableHour + 1);

    const headers = [
      { key: 'patient', header: t('patient', 'Patient') },
      { key: 'time', header: t('time', 'Time') },
      { key: 'provider', header: t('provider', 'Provider') },
      { key: 'service', header: t('service', 'Service') },
      { key: 'status', header: t('status', 'Status') },
    ];

    const rows = tableAppointments.map((appt) => {
      const extAppt = appt as ExtendedAppointment;
      const startTime = appt.startDateTime ? formatAMPM(new Date(appt.startDateTime)) : '—';
      const endTime = appt.endDateTime ? formatAMPM(new Date(appt.endDateTime)) : '';
      const serviceColor = (appt.service?.uuid && serviceColorMap?.get(appt.service.uuid)) || '#0f62fe';
      const tagType = STATUS_TAG_TYPES[appt.status] ?? DEFAULT_STATUS_TAG_TYPE;
      const provName = appt.providers?.[0]?.name || extAppt.provider?.display || extAppt.provider?.name || '—';

      return {
        id: appt.uuid,
        rawAppointment: appt,
        patient: appt.patient?.name ?? '—',
        time: `${startTime}${endTime ? ` – ${endTime}` : ''}`,
        provider: provName,
        service: (
          <span className={styles.tableServiceCell}>
            <span className={styles.serviceColorDot} style={{ backgroundColor: serviceColor }} />
            {appt.service?.name ?? '—'}
          </span>
        ),
        status: appt.status ? (
          <Tag type={tagType} size="sm">
            {appt.status}
          </Tag>
        ) : (
          '—'
        ),
      };
    });

    return (
      <div className={styles.container} data-testid="daily-table-view">
        <div className={styles.tableHeaderSection}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ArrowLeft}
            onClick={() => setActiveTableHour(null)}
            className={styles.backButton}>
            {t('backToDay', 'Back to day')}
          </Button>
          <div className={styles.tableHeaderTitles}>
            <h4 className={styles.tableTitle}>
              {calendarSelectedDate.format('dddd, MMM D')} · {hourLabel}
            </h4>
            <span className={styles.tableSubtitle}>
              {t('appointmentCount', '{{count}} appointments', { count: tableAppointments.length })}
            </span>
          </div>
        </div>

        <DataTable rows={rows} headers={headers}>
          {({ rows: tableRows, headers: tableHeaders, getHeaderProps, getRowProps, getTableProps }) => (
            <Table {...getTableProps()} className={styles.interactiveTable}>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => {
                  const original = rows.find((r) => r.id === row.id);
                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      key={row.id}
                      className={styles.clickableRow}
                      onClick={() => original?.rawAppointment && setSelectedAppointment(original.rawAppointment)}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DataTable>

        {selectedAppointment && (
          <AppointmentDetailsDrawer
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onEdit={() => handleEdit(selectedAppointment)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="daily-calendar-view">
      <div className={styles.heading}>
        <p className={styles.subtitle}>
          {appointments.length === 0
            ? t('noAppointmentsBadge', 'No appointments')
            : t('appointmentCount', '{{count}} appointment(s)', { count: appointments.length })}
        </p>
      </div>

      {segments.map((segment) => {
        if (segment.type === 'occupied') {
          const isHighDensity = segment.appointments.length > 4;

          return (
            <div key={`hour-${segment.hour}`} className={styles.hourRow} data-testid={`hour-row-${segment.hour}`}>
              <div className={styles.hourLabel}>{formatHourLabel(segment.hour)}</div>
              <div className={styles.hourSlot}>
                {isHighDensity ? (
                  <HighDensitySummaryCard
                    hour={segment.hour}
                    appointments={segment.appointments}
                    serviceColorMap={serviceColorMap}
                    onOpenTable={() => setActiveTableHour(segment.hour)}
                  />
                ) : (
                  segment.appointments.map((a) => (
                    <DailyCard
                      key={a.uuid}
                      appointment={a}
                      serviceColorMap={serviceColorMap}
                      onClick={() => setSelectedAppointment(a)}
                    />
                  ))
                )}
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

      {selectedAppointment && (
        <AppointmentDetailsDrawer
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onEdit={() => handleEdit(selectedAppointment)}
        />
      )}
    </div>
  );
};

interface AppointmentDetailsDrawerProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}

const AppointmentDetailsDrawer: React.FC<AppointmentDetailsDrawerProps> = ({ appointment, onClose, onEdit }) => {
  const { t } = useTranslation();
  const rawAppt = appointment as ExtendedAppointment;

  const initials = useMemo(() => {
    const name = appointment.patient?.name || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'PT';
  }, [appointment.patient?.name]);

  const formattedDateTime = useMemo(() => {
    if (!appointment.startDateTime) return '—';
    const start = dayjs(appointment.startDateTime);
    const end = appointment.endDateTime ? dayjs(appointment.endDateTime) : null;
    return `${start.format('ddd, DD-MMM-YYYY')} · ${start.format('h:mm A')}${end ? ` – ${end.format('h:mm A')}` : ''}`;
  }, [appointment.startDateTime, appointment.endDateTime]);

  const dateIssued = useMemo(() => {
    if (rawAppt.dateTimeCreated) {
      return dayjs(rawAppt.dateTimeCreated).format('DD-MMM-YYYY');
    }
    return appointment.startDateTime ? dayjs(appointment.startDateTime).format('DD-MMM-YYYY') : '—';
  }, [rawAppt.dateTimeCreated, appointment.startDateTime]);

  const providerName = appointment.providers?.[0]?.name || rawAppt.provider?.display || rawAppt.provider?.name || '—';

  const locationName = appointment.location?.name || 'Outpatient Clinic';

  const serviceName = appointment.service?.name || '—';
  const appointmentType = rawAppt.appointmentType?.name || rawAppt.appointmentType?.display || 'New';
  const statusTagType = STATUS_TAG_TYPES[appointment.status] ?? DEFAULT_STATUS_TAG_TYPE;

  const patient = appointment.patient as ExtendedPatient | undefined;
  const rawGender = patient?.gender || patient?.sex || '';
  const gender =
    rawGender === 'M' || rawGender.toLowerCase() === 'male'
      ? 'Male'
      : rawGender === 'F' || rawGender.toLowerCase() === 'female'
        ? 'Female'
        : rawGender;
  const age = patient?.age ? `${patient.age} yrs` : '';
  const birthDate = patient?.birthDate ? dayjs(patient.birthDate).format('DD-MMM-YYYY') : '';
  const identifier =
    patient?.identifier ||
    patient?.identifiers?.[0]?.identifier ||
    patient?.identifiers?.[0]?.value ||
    patient?.uuid?.slice(0, 7) ||
    '—';

  return (
    <aside className={styles.drawerOverlay} aria-label={t('appointmentDetails', 'Appointment details')}>
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>{t('appointmentDetails', 'Appointment details')}</span>
          <button type="button" className={styles.drawerCloseBtn} onClick={onClose} aria-label={t('close', 'Close')}>
            <Close size={20} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.mockPatientCard}>
            <div className={styles.avatarTile}>{initials}</div>
            <div className={styles.mockPatientInfo}>
              <div className={styles.patientNameLine}>
                <span className={styles.mockPatientName}>{appointment.patient?.name ?? '—'}</span>
                {gender && <span className={styles.mockPatientGender}>{gender}</span>}
                <Tag type="blue" size="sm" style={{ margin: 0 }}>
                  Active Visit
                </Tag>
              </div>
              {(age || birthDate) && (
                <div className={styles.mockDemographics}>{[age, birthDate].filter(Boolean).join(' · ')}</div>
              )}
              <div className={styles.identifierPill}>
                <span>OpenMRS ID: </span>
                <strong>{identifier}</strong>
              </div>
            </div>
          </div>

          <div className={styles.dateTimeSection}>
            <div className={styles.sectionMetaLabel}>{t('appointmentDateAndTime', 'Appointment date & time')}</div>
            <div className={styles.dateTimeValue}>{formattedDateTime}</div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.gridField}>
              <span className={styles.gridLabel}>{t('provider', 'Provider')}</span>
              <span className={styles.gridValue}>{providerName}</span>
            </div>
            <div className={styles.gridField}>
              <span className={styles.gridLabel}>{t('location', 'Location')}</span>
              <span className={styles.gridValue}>{locationName}</span>
            </div>
            <div className={styles.gridField}>
              <span className={styles.gridLabel}>{t('service', 'Service')}</span>
              <span className={styles.gridValue}>{serviceName}</span>
            </div>
            <div className={styles.gridField}>
              <span className={styles.gridLabel}>{t('appointmentType', 'Appointment type')}</span>
              <span className={styles.gridValue}>{appointmentType}</span>
            </div>
            <div className={styles.gridField}>
              <span className={styles.gridLabel}>{t('recurringAppointment', 'Recurring appointment')}</span>
              <span className={styles.gridValue}>
                {appointment.recurring
                  ? rawAppt.recurringPattern || t('repeatsEveryWeek', 'repeats every 1 week')
                  : t('doesNotRepeat', 'Does not repeat')}
              </span>
            </div>
            <div className={styles.gridField}>
              <span className={styles.gridLabel}>{t('status', 'Status')}</span>
              <span className={styles.gridValue}>
                <Tag type={statusTagType} size="sm">
                  {appointment.status || 'Scheduled'}
                </Tag>
              </span>
            </div>
          </div>

          <div className={styles.singleFieldSection}>
            <span className={styles.gridLabel}>{t('dateIssued', 'Date issued')}</span>
            <span className={styles.gridValue}>{dateIssued}</span>
          </div>

          <div className={styles.noteSection}>
            <span className={styles.gridLabel}>{t('note', 'Note')}</span>
            <div className={styles.noteCallout}>{appointment.comments || rawAppt.note || t('noNotes', 'None')}</div>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
            {t('close', 'Close')}
          </button>
          <button type="button" className={styles.modalEditBtn} onClick={onEdit}>
            {t('editAppointment', 'Edit appointment')}
          </button>
        </div>
      </div>
    </aside>
  );
};

interface HighDensitySummaryCardProps {
  hour: number;
  appointments: Array<Appointment>;
  serviceColorMap?: Map<string, string>;
  onOpenTable: () => void;
}

const HighDensitySummaryCard: React.FC<HighDensitySummaryCardProps> = ({
  appointments,
  serviceColorMap,
  onOpenTable,
}) => {
  const { t } = useTranslation();

  const serviceCounts = useMemo(() => {
    const defaultPalette: Record<string, string> = {
      'General Medicine': '#0f62fe',
      'Outpatient Dept.': '#24a148',
      Rehabilitation: '#a56eff',
      Laboratory: '#ff832b',
    };

    const counts = new Map<string, { name: string; count: number; color: string }>();
    appointments.forEach((appt) => {
      const sId = appt.service?.uuid ?? 'unknown';
      const sName = appt.service?.name ?? t('other', 'Other');
      const sColor =
        (appt.service?.uuid && serviceColorMap?.get(appt.service.uuid)) || defaultPalette[sName] || '#0f62fe';
      if (!counts.has(sId)) {
        counts.set(sId, { name: sName, count: 0, color: sColor });
      }
      counts.get(sId)!.count += 1;
    });
    return Array.from(counts.values());
  }, [appointments, serviceColorMap, t]);

  return (
    <div className={styles.highDensityCard} data-testid="high-density-summary">
      <div className={styles.highDensityHeader}>
        <span className={styles.highDensityCountTitle}>
          {t('appointmentCount', '{{count}} appointments', { count: appointments.length })}
        </span>
        <span className={styles.highDensitySubtitle}>
          {t(
            'highDensityNotice',
            '{{count}} overlap at once — over the legible limit. Narrow it down or open the full list.',
            { count: appointments.length },
          )}
        </span>
      </div>

      <div className={styles.serviceChipsContainer}>
        <span className={styles.filterToServiceLabel}>{t('filterToService', 'FILTER TO A SERVICE')}</span>
        <div className={styles.serviceChips}>
          {serviceCounts.map((sc) => (
            <div key={sc.name} className={styles.serviceChip}>
              <span className={styles.chipColorSwatch} style={{ backgroundColor: sc.color }} />
              <span className={styles.chipText}>{`${sc.name} ${sc.count}`}</span>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className={styles.openTableBtn} onClick={onOpenTable}>
        {t('openInTable', 'Open in table')} <ArrowRight size={16} />
      </button>
    </div>
  );
};

interface DailyCardProps {
  appointment: Appointment;
  serviceColorMap?: Map<string, string>;
  onClick: () => void;
}

const DailyCard: React.FC<DailyCardProps> = ({ appointment, serviceColorMap, onClick }) => {
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

  const extAppt = appointment as ExtendedAppointment;
  const providerName = appointment.providers?.[0]?.name || extAppt.provider?.display || extAppt.provider?.name || '';
  const serviceName = appointment.service?.name;

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      data-testid={`appointment-card-${appointment.uuid}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        borderLeftColor: serviceColor,
        backgroundColor: hexToRgba(serviceColor, 0.1),
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
