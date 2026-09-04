import dayjs from 'dayjs';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';

/**
 * Deterministic demo/testing fixture appointments for visually checking calendar views during development.
 * Enabled via the ?mockAppointments=1 query parameter in non-production environments.
 */

interface MockSlot {
  hour: number;
  minute: number;
  duration: number;
  service: 'gm' | 'opd' | 'rehab' | 'lab';
  status: AppointmentStatus;
  patient: string;
  provider?: string;
}

const SERVICES: Record<MockSlot['service'], { name: string; uuid: string; durationMins: number }> = {
  gm: { name: 'General Medicine', uuid: 'mock-service-gm', durationMins: 15 },
  opd: { name: 'Outpatient Dept.', uuid: 'mock-service-opd', durationMins: 30 },
  rehab: { name: 'Rehabilitation', uuid: 'mock-service-rehab', durationMins: 30 },
  lab: { name: 'Laboratory', uuid: 'mock-service-lab', durationMins: 30 },
};

const PATIENTS: Array<{ identifier: string; name: string; uuid: string }> = [
  { identifier: '100GEJ', name: 'John Wilson', uuid: 'mock-patient-1' },
  { identifier: '100732HE', name: 'Jane Smith', uuid: 'mock-patient-2' },
  { identifier: '100JKM', name: 'Emily Johnson', uuid: 'mock-patient-3' },
  { identifier: '100LPN', name: 'Susan Lopez', uuid: 'mock-patient-4' },
  { identifier: '100MQR', name: 'Rosa Mendez', uuid: 'mock-patient-5' },
  { identifier: '100NST', name: 'Grace Achieng', uuid: 'mock-patient-6' },
  { identifier: '100PUV', name: 'Peter Okafor', uuid: 'mock-patient-7' },
  { identifier: '100QWX', name: 'Maria Santos', uuid: 'mock-patient-8' },
  { identifier: '100RYZ', name: 'David Kim', uuid: 'mock-patient-9' },
  { identifier: '100TAB', name: 'Anne Wanjiku', uuid: 'mock-patient-10' },
  { identifier: '100UCD', name: 'Omar Haddad', uuid: 'mock-patient-11' },
  { identifier: '100VEF', name: 'Lucia Fernandez', uuid: 'mock-patient-12' },
];

const DEFAULT_PROVIDER = 'doctor - James Cook';
const SUPER_USER_PROVIDER = 'Super User';

const WEEKDAY_SLOTS: MockSlot[] = [
  { hour: 8, minute: 0, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'John Wilson' },
  { hour: 8, minute: 30, duration: 30, service: 'opd', status: AppointmentStatus.SCHEDULED, patient: 'Jane Smith' },
  { hour: 9, minute: 0, duration: 15, service: 'gm', status: AppointmentStatus.CHECKEDIN, patient: 'Emily Johnson' },
  // overlaps the 9:00 appointment → two side-by-side lanes
  { hour: 9, minute: 12, duration: 15, service: 'gm', status: AppointmentStatus.CHECKEDIN, patient: 'Susan Lopez' },
  { hour: 9, minute: 30, duration: 45, service: 'lab', status: AppointmentStatus.SCHEDULED, patient: 'Rosa Mendez' },
  {
    hour: 10,
    minute: 0,
    duration: 60,
    service: 'rehab',
    status: AppointmentStatus.COMPLETED,
    patient: 'Grace Achieng',
  },
  { hour: 10, minute: 30, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'Peter Okafor' },
  { hour: 11, minute: 0, duration: 30, service: 'opd', status: AppointmentStatus.SCHEDULED, patient: 'Maria Santos' },
  { hour: 11, minute: 15, duration: 30, service: 'opd', status: AppointmentStatus.SCHEDULED, patient: 'David Kim' },
  { hour: 11, minute: 45, duration: 15, service: 'gm', status: AppointmentStatus.CANCELLED, patient: 'Anne Wanjiku' },
  { hour: 12, minute: 30, duration: 30, service: 'lab', status: AppointmentStatus.SCHEDULED, patient: 'Omar Haddad' },
  { hour: 13, minute: 0, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'Lucia Fernandez' },
  // busy hour: 7 simultaneous appointments at 14:28 → over the legibility ceiling
  { hour: 14, minute: 0, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'John Wilson' },
  { hour: 14, minute: 5, duration: 30, service: 'gm', status: AppointmentStatus.CHECKEDIN, patient: 'Emily Johnson' },
  { hour: 14, minute: 10, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'Peter Okafor' },
  { hour: 14, minute: 15, duration: 30, service: 'opd', status: AppointmentStatus.SCHEDULED, patient: 'Jane Smith' },
  { hour: 14, minute: 20, duration: 30, service: 'opd', status: AppointmentStatus.SCHEDULED, patient: 'Maria Santos' },
  { hour: 14, minute: 25, duration: 30, service: 'lab', status: AppointmentStatus.SCHEDULED, patient: 'Omar Haddad' },
  { hour: 14, minute: 28, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'Susan Lopez' },
  {
    hour: 15,
    minute: 0,
    duration: 30,
    service: 'rehab',
    status: AppointmentStatus.SCHEDULED,
    patient: 'Grace Achieng',
  },
  { hour: 15, minute: 30, duration: 15, service: 'gm', status: AppointmentStatus.MISSED, patient: 'David Kim' },
  { hour: 16, minute: 0, duration: 30, service: 'lab', status: AppointmentStatus.SCHEDULED, patient: 'Rosa Mendez' },
  // 5-minute appointments, exactly like the reported case
  {
    hour: 18,
    minute: 11,
    duration: 5,
    service: 'gm',
    status: AppointmentStatus.SCHEDULED,
    patient: 'Emily Johnson',
    provider: SUPER_USER_PROVIDER,
  },
  {
    hour: 18,
    minute: 12,
    duration: 5,
    service: 'gm',
    status: AppointmentStatus.SCHEDULED,
    patient: 'Susan Lopez',
    provider: SUPER_USER_PROVIDER,
  },
];

const SATURDAY_SLOTS: MockSlot[] = [
  { hour: 10, minute: 0, duration: 30, service: 'gm', status: AppointmentStatus.SCHEDULED, patient: 'John Wilson' },
  { hour: 11, minute: 0, duration: 30, service: 'lab', status: AppointmentStatus.SCHEDULED, patient: 'Rosa Mendez' },
  { hour: 12, minute: 0, duration: 30, service: 'opd', status: AppointmentStatus.SCHEDULED, patient: 'Jane Smith' },
];

export function generateMockAppointments(isoDate: string): Array<Appointment> {
  const date = dayjs(isoDate);
  const dow = date.day();
  const slots = dow === 0 ? [] : dow === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;

  return slots.map((slot, i) => {
    const start = date.hour(slot.hour).minute(slot.minute).second(0).millisecond(0);
    const service = SERVICES[slot.service];
    const patient = PATIENTS.find((p) => p.name === slot.patient) ?? PATIENTS[0];
    const provider = slot.provider ?? DEFAULT_PROVIDER;

    return {
      uuid: `mock-appointment-${i}`,
      appointmentNumber: `APT-MOCK-${i}`,
      appointmentKind: AppointmentKind.SCHEDULED,
      comments: '',
      endDateTime: start.add(slot.duration, 'minute').valueOf(),
      location: { uuid: 'mock-location', name: 'Outpatient Clinic' },
      patient,
      provider: { uuid: `mock-provider-${provider}`, display: provider },
      providers: [{ uuid: `mock-provider-${provider}`, display: provider }],
      recurring: false,
      service: {
        appointmentServiceId: i,
        creatorName: 'Mock Data',
        description: `Mock ${service.name} service`,
        durationMins: service.durationMins,
        endTime: '17:00',
        initialAppointmentStatus: 'Scheduled',
        maxAppointmentsLimit: null,
        name: service.name,
        startTime: '08:00',
        uuid: service.uuid,
      },
      startDateTime: start.valueOf(),
      dateAppointmentScheduled: start.valueOf(),
      status: slot.status,
      voided: false,
      extensions: {},
      teleconsultationLink: null,
    };
  });
}
