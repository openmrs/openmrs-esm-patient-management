import { describe, expect, it } from 'vitest';
import { AppointmentStatus, type Appointment } from '../../types';
import {
  aggregateDailyCountsByService,
  extractLocationOptions,
  extractProviderOptions,
  filterAppointments,
} from './calendar-filters';

const svc = (name: string, uuid: string, id: number) => ({
  appointmentServiceId: id,
  creatorName: '',
  description: '',
  endTime: '17:00',
  initialAppointmentStatus: 'Scheduled',
  maxAppointmentsLimit: null,
  name,
  startTime: '08:00',
  uuid,
});

const mockAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    uuid: 'test-uuid',
    appointmentNumber: '0001',
    appointmentKind: 'Scheduled',
    comments: '',
    endDateTime: null,
    location: { uuid: 'loc-uuid', name: 'Test Clinic' },
    patient: { identifier: 'PAT-001', name: 'Test Patient', uuid: 'pat-uuid' },
    provider: { uuid: 'prov-uuid', display: 'Dr. Test' },
    providers: [],
    recurring: false,
    service: svc('Outpatient', 'svc-uuid', 1),
    startDateTime: new Date('2026-08-10T09:00:00').getTime(),
    status: 'Scheduled',
    voided: false,
    extensions: {},
    teleconsultationLink: null,
    ...overrides,
  }) as Appointment;

describe('filterAppointments', () => {
  const appts = [
    mockAppointment({ uuid: 'a1', service: svc('OPD', 'svc1', 1) }),
    mockAppointment({ uuid: 'a2', service: svc('Lab', 'svc2', 2) }),
  ];

  it('returns all appointments when no filters are selected', () => {
    expect(filterAppointments(appts, { serviceUuids: [], providerUuids: [], locationUuids: [] })).toHaveLength(2);
  });

  it('filters by service uuid', () => {
    const filtered = filterAppointments(appts, { serviceUuids: ['svc1'], providerUuids: [], locationUuids: [] });
    expect(filtered.map((a) => a.uuid)).toEqual(['a1']);
  });

  it('filters by provider uuid matching any of the providers array', () => {
    const appts = [
      mockAppointment({
        uuid: 'a1',
        provider: { uuid: 'p1', display: 'Dr. A' },
        providers: [{ uuid: 'p1' }, { uuid: 'p2' }],
      }),
      mockAppointment({ uuid: 'a2', provider: { uuid: 'p3', display: 'Dr. B' }, providers: [] }),
    ];
    const filtered = filterAppointments(appts, { serviceUuids: [], providerUuids: ['p2'], locationUuids: [] });
    expect(filtered.map((a) => a.uuid)).toEqual(['a1']);
  });

  it('falls back to the single provider field when providers is empty', () => {
    const appts = [mockAppointment({ uuid: 'a1', provider: { uuid: 'p1', display: 'Dr. A' }, providers: [] })];
    const filtered = filterAppointments(appts, { serviceUuids: [], providerUuids: ['p1'], locationUuids: [] });
    expect(filtered.map((a) => a.uuid)).toEqual(['a1']);
  });

  it('filters by location uuid', () => {
    const appts = [
      mockAppointment({ uuid: 'a1', location: { uuid: 'loc1', name: 'OPD Clinic' } }),
      mockAppointment({ uuid: 'a2', location: { uuid: 'loc2', name: 'Lab' } }),
    ];
    const filtered = filterAppointments(appts, { serviceUuids: [], providerUuids: [], locationUuids: ['loc1'] });
    expect(filtered.map((a) => a.uuid)).toEqual(['a1']);
  });

  it('combines service, provider and location filters', () => {
    const appts = [
      mockAppointment({
        uuid: 'a1',
        service: svc('OPD', 'svc1', 1),
        provider: { uuid: 'p1', display: 'Dr. A' },
        providers: [{ uuid: 'p1' }],
        location: { uuid: 'loc1', name: 'OPD Clinic' },
      }),
      mockAppointment({
        uuid: 'a2',
        service: svc('OPD', 'svc1', 1),
        provider: { uuid: 'p2', display: 'Dr. B' },
        providers: [{ uuid: 'p2' }],
        location: { uuid: 'loc1', name: 'OPD Clinic' },
      }),
    ];
    const filtered = filterAppointments(appts, {
      serviceUuids: ['svc1'],
      providerUuids: ['p1'],
      locationUuids: ['loc1'],
    });
    expect(filtered.map((a) => a.uuid)).toEqual(['a1']);
  });
});

describe('aggregateDailyCountsByService', () => {
  it('groups appointments by day and service with counts', () => {
    const appts = [
      mockAppointment({ uuid: 'a1', startDateTime: new Date('2026-08-10T09:00:00').getTime() }),
      mockAppointment({ uuid: 'a2', startDateTime: new Date('2026-08-10T14:00:00').getTime() }),
      mockAppointment({
        uuid: 'a3',
        startDateTime: new Date('2026-08-11T09:00:00').getTime(),
        service: svc('Lab', 'svc2', 2),
      }),
    ];

    const result = aggregateDailyCountsByService(appts);

    expect(result).toEqual([
      { appointmentDate: '2026-08-10', services: [{ serviceName: 'Outpatient', serviceUuid: 'svc-uuid', count: 2 }] },
      { appointmentDate: '2026-08-11', services: [{ serviceName: 'Lab', serviceUuid: 'svc2', count: 1 }] },
    ]);
  });

  it('excludes cancelled appointments to stay consistent with appointmentSummary', () => {
    const appts = [
      mockAppointment({ uuid: 'a1', status: AppointmentStatus.CANCELLED }),
      mockAppointment({ uuid: 'a2', status: AppointmentStatus.SCHEDULED }),
    ];

    const result = aggregateDailyCountsByService(appts);

    expect(result).toEqual([
      { appointmentDate: '2026-08-10', services: [{ serviceName: 'Outpatient', serviceUuid: 'svc-uuid', count: 1 }] },
    ]);
  });

  it('skips appointments without a startDateTime', () => {
    const appts = [mockAppointment({ uuid: 'a1', startDateTime: null })];

    expect(aggregateDailyCountsByService(appts)).toEqual([]);
  });

  it('returns an empty array when there are no appointments', () => {
    expect(aggregateDailyCountsByService([])).toEqual([]);
  });
});

describe('extractProviderOptions', () => {
  it('deduplicates providers and uses display as label', () => {
    const appts = [
      mockAppointment({
        uuid: 'a1',
        provider: { uuid: 'p1', display: 'Dr. A' },
        providers: [
          { uuid: 'p1', display: 'Dr. A' },
          { uuid: 'p2', display: 'Dr. B' },
        ],
      }),
      mockAppointment({
        uuid: 'a2',
        provider: { uuid: 'p2', display: 'Dr. B' },
        providers: [{ uuid: 'p2', display: 'Dr. B' }],
      }),
    ];

    const options = extractProviderOptions(appts);

    expect(options).toEqual([
      { uuid: 'p1', label: 'Dr. A' },
      { uuid: 'p2', label: 'Dr. B' },
    ]);
  });

  it('returns an empty array when no appointments have providers', () => {
    expect(extractProviderOptions([])).toEqual([]);
  });
});

describe('extractLocationOptions', () => {
  it('deduplicates locations and uses name as label', () => {
    const appts = [
      mockAppointment({ uuid: 'a1', location: { uuid: 'loc1', name: 'OPD Clinic' } }),
      mockAppointment({ uuid: 'a2', location: { uuid: 'loc1', name: 'OPD Clinic' } }),
      mockAppointment({ uuid: 'a3', location: { uuid: 'loc2', name: 'Lab' } }),
    ];

    const options = extractLocationOptions(appts);

    expect(options).toEqual([
      { uuid: 'loc2', label: 'Lab' },
      { uuid: 'loc1', label: 'OPD Clinic' },
    ]);
  });

  it('returns an empty array when no appointments have locations', () => {
    expect(extractLocationOptions([])).toEqual([]);
  });
});
