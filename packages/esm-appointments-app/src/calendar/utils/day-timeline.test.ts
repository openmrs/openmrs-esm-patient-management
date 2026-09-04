import { describe, it, expect } from 'vitest';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import {
  appointmentDuration,
  buildHourSlots,
  buildTimelineRanges,
  formatTimeRange,
  getLaneCeiling,
  hexToRgba,
  packDayLanes,
  peakConcurrency,
  toMinutes,
} from './day-timeline';

const baseAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  uuid: '3b4d4f2a-7c8d-4e1f-9a6b-5c8d2e1f4a7b',
  appointmentNumber: 'APT-0001',
  appointmentKind: AppointmentKind.SCHEDULED,
  comments: '',
  endDateTime: new Date('2026-06-09T09:15:00').getTime(),
  location: { uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574', name: 'Inpatient Ward' },
  patient: { identifier: '100GEJ', name: 'John Wilson', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  provider: { uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66', display: 'doctor - James Cook' },
  providers: [{ uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66' }],
  recurring: false,
  service: {
    appointmentServiceId: 1,
    creatorName: 'Test Creator',
    description: 'Outpatient service',
    durationMins: 15,
    endTime: '17:00',
    initialAppointmentStatus: 'Scheduled',
    maxAppointmentsLimit: null,
    name: 'Outpatient',
    startTime: '08:00',
    uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
  },
  startDateTime: new Date('2026-06-09T09:00:00').getTime(),
  dateAppointmentScheduled: new Date('2026-06-09T00:00:00.000Z').getTime(),
  status: AppointmentStatus.SCHEDULED,
  voided: false,
  extensions: {},
  teleconsultationLink: null,
  ...overrides,
});

const at = (time: string, uuid: string) =>
  baseAppointment({
    uuid,
    startDateTime: new Date(`2026-06-09T${time}:00`).getTime(),
    endDateTime: new Date(`2026-06-09T${time}:00`).getTime() + 15 * 60000,
  });

const atDur = (time: string, uuid: string, durMins: number) =>
  baseAppointment({
    uuid,
    startDateTime: new Date(`2026-06-09T${time}:00`).getTime(),
    endDateTime: new Date(`2026-06-09T${time}:00`).getTime() + durMins * 60000,
  });

describe('appointmentDuration', () => {
  it('uses endDateTime - startDateTime when both exist', () => {
    expect(appointmentDuration(at('09:00', 'a'))).toBe(15);
  });

  it('falls back to service.durationMins when endDateTime is null', () => {
    const appointment = at('09:00', 'a');
    appointment.endDateTime = null;
    expect(appointmentDuration(appointment)).toBe(15);
  });

  it('falls back to service duration when endDateTime is earlier than startDateTime', () => {
    const appointment = at('09:00', 'a');
    appointment.endDateTime = new Date('2026-06-09T08:00:00').getTime();
    expect(appointmentDuration(appointment)).toBe(15);
  });

  it('falls back to 10 mins default when service duration is 0 or negative', () => {
    const appointment = at('09:00', 'a');
    appointment.endDateTime = null;
    appointment.service = { ...appointment.service, durationMins: 0 };
    expect(appointmentDuration(appointment)).toBe(10);
  });

  it('falls back to 10 mins default when service is missing or durationMins is missing', () => {
    const appointment = at('09:00', 'a');
    appointment.endDateTime = null;
    appointment.service = null;
    expect(appointmentDuration(appointment)).toBe(10);
  });
});

describe('toMinutes', () => {
  it('converts epoch ms to minutes from local midnight', () => {
    expect(toMinutes(new Date('2026-06-09T09:30:00').getTime())).toBe(570);
  });
});

describe('packDayLanes', () => {
  it('gives overlapping appointments separate lanes', () => {
    const lanes = packDayLanes([atDur('09:00', 'a', 30), atDur('09:15', 'b', 30)]);
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get('b')).toEqual({ lane: 1, lanes: 2 });
  });

  it('reuses a lane for back-to-back appointments', () => {
    const a = at('09:00', 'a');
    a.endDateTime = new Date('2026-06-09T09:30:00').getTime();
    const b = at('09:30', 'b');
    b.endDateTime = new Date('2026-06-09T10:00:00').getTime();
    const lanes = packDayLanes([a, b]);
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 1 });
    expect(lanes.get('b')).toEqual({ lane: 0, lanes: 1 });
  });

  it('packs three overlapping appointments into three lanes', () => {
    const lanes = packDayLanes([atDur('09:00', 'a', 30), atDur('09:10', 'b', 30), atDur('09:20', 'c', 30)]);
    expect(lanes.get('a')?.lanes).toBe(3);
  });

  it('packs cross-hour overlapping appointments into separate lanes with consistent lane count', () => {
    // Appointment A: 09:50 - 10:20, Appointment B: 10:00 - 10:30
    const a = atDur('09:50', 'a', 30);
    const b = atDur('10:00', 'b', 30);
    const lanes = packDayLanes([a, b]);
    expect(lanes.get('a')?.lane).toBe(0);
    expect(lanes.get('b')?.lane).toBe(1);
    expect(lanes.get('a')?.lanes).toBe(2);
    expect(lanes.get('b')?.lanes).toBe(2);
  });

  it('reuses lane 0 across separate clusters', () => {
    const lanes = packDayLanes([at('09:00', 'a'), at('14:00', 'b')]);
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 1 });
    expect(lanes.get('b')).toEqual({ lane: 0, lanes: 1 });
  });
});

describe('peakConcurrency', () => {
  it('does not count back-to-back appointments as simultaneous', () => {
    expect(
      peakConcurrency([
        { s: 540, e: 570 },
        { s: 570, e: 600 },
      ]),
    ).toBe(1);
  });

  it('counts nested overlaps as max depth', () => {
    expect(
      peakConcurrency([
        { s: 540, e: 600 },
        { s: 550, e: 560 },
      ]),
    ).toBe(2);
    expect(
      peakConcurrency([
        { s: 540, e: 600 },
        { s: 550, e: 560 },
        { s: 555, e: 565 },
      ]),
    ).toBe(3);
  });
});

describe('getLaneCeiling', () => {
  it('returns 6 with the default container width', () => {
    expect(getLaneCeiling()).toBe(6);
  });

  it('never returns less than 1', () => {
    expect(getLaneCeiling(50)).toBe(1);
  });
});

describe('buildHourSlots', () => {
  it('places a block in its start hour with full duration', () => {
    const slots = buildHourSlots([at('09:00', 'a')]);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.blocks).toHaveLength(1);
    expect(slot9?.blocks[0].lane).toBe(0);
    expect(slot9?.blocks[0].s).toBe(540);
    expect(slot9?.blocks[0].e).toBe(555);
    expect(slot9?.blocks[0].topPx).toBe(0);
    expect(slot9?.blocks[0].heightPx).toBe(30);
    expect(slots.filter((s) => s.blocks.length > 0)).toHaveLength(1);
  });

  it('positions a block at its minute offset within the hour', () => {
    const slots = buildHourSlots([at('09:30', 'a')]);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.blocks[0].topPx).toBe(64);
  });

  it('splits overlapping blocks into side-by-side lanes', () => {
    const slots = buildHourSlots([atDur('09:00', 'a', 30), atDur('09:15', 'b', 30)]);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.blocks[0].lane).toBe(0);
    expect(slot9?.blocks[0].lanes).toBe(2);
    expect(slot9?.blocks[1].lane).toBe(1);
    expect(slot9?.blocks[1].lanes).toBe(2);
  });

  it('flags an hour as exceeding the ceiling when peak is too high', () => {
    const appts = ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:28'].map((t, i) =>
      atDur(t, `uuid-${i}`, 30),
    );
    const slots = buildHourSlots(appts);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.peak).toBe(7);
    expect(slot9?.exceedsCeiling).toBe(true);
  });

  it('keeps an hour under the ceiling for a small overlap', () => {
    const slots = buildHourSlots([at('09:00', 'a'), at('09:30', 'b')]);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.peak).toBe(1);
    expect(slot9?.exceedsCeiling).toBe(false);
  });

  it('counts spill-in appointments toward peak and includes them in allAppointments', () => {
    const a = at('08:55', 'a');
    a.endDateTime = new Date('2026-06-09T09:10:00').getTime();
    const b = at('09:00', 'b');
    const slots = buildHourSlots([a, b]);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.blocks.map((bl) => bl.appointment.uuid)).toEqual(['b']);
    expect(slot9?.allAppointments.map((appt) => appt.uuid)).toEqual(['a', 'b']);
    expect(slot9?.peak).toBe(2);
  });

  it('excludes appointments with null startDateTime', () => {
    const a = at('09:00', 'a');
    a.startDateTime = null;
    const slots = buildHourSlots([a]);
    expect(slots.every((s) => s.blocks.length === 0)).toBe(true);
    expect(slots.every((s) => s.allAppointments.length === 0)).toBe(true);
  });

  it('gives short appointments a minimum height so the text is visible', () => {
    const a = atDur('09:00', 'a', 5);
    const slots = buildHourSlots([a]);
    const block = slots.find((s) => s.hour === 9)?.blocks[0];
    expect(block?.heightPx).toBe(26);
  });

  it('pushes same-lane neighbors apart when minimum heights would collide', () => {
    const a = atDur('09:00', 'a', 5);
    const b = atDur('09:05', 'b', 5);
    const slots = buildHourSlots([a, b]);
    const blocks = slots.find((s) => s.hour === 9)?.blocks ?? [];
    expect(blocks).toHaveLength(2);
    expect(blocks[0].topPx).toBe(0);
    expect(blocks[1].topPx).toBe(26);
    expect(blocks[1].topPx).toBeGreaterThanOrEqual(blocks[0].topPx + blocks[0].heightPx);
  });

  it('expands minHeightPx beyond HOUR_HEIGHT_PX when stacked short blocks exceed 128px', () => {
    const appts = [0, 2, 4, 6, 8, 10].map((m, i) => atDur(`09:${String(m).padStart(2, '0')}`, `appt-${i}`, 2));
    const slots = buildHourSlots(appts, 10);
    const slot9 = slots.find((s) => s.hour === 9);
    expect(slot9?.minHeightPx).toBe(156);
  });
});

describe('buildTimelineRanges', () => {
  it('emits earlier, live clinic hours, and later ranges with defaults (8 AM – 5 PM)', () => {
    const ranges = buildTimelineRanges();
    expect(ranges).toEqual([
      { kind: 'earlier', h0: 0, h1: 7 },
      { kind: 'live', h0: 8, h1: 16 },
      { kind: 'later', h0: 17, h1: 23 },
    ]);
  });

  it('supports custom clinic start and end hours', () => {
    const ranges = buildTimelineRanges(9, 18);
    expect(ranges).toEqual([
      { kind: 'earlier', h0: 0, h1: 8 },
      { kind: 'live', h0: 9, h1: 17 },
      { kind: 'later', h0: 18, h1: 23 },
    ]);
  });

  it('handles clinic starting at midnight (h0 = 0)', () => {
    const ranges = buildTimelineRanges(0, 17);
    expect(ranges).toEqual([
      { kind: 'live', h0: 0, h1: 16 },
      { kind: 'later', h0: 17, h1: 23 },
    ]);
  });

  it('handles clinic ending at midnight (clinicEnd = 24)', () => {
    const ranges = buildTimelineRanges(8, 24);
    expect(ranges).toEqual([
      { kind: 'earlier', h0: 0, h1: 7 },
      { kind: 'live', h0: 8, h1: 23 },
    ]);
  });
});

describe('formatTimeRange', () => {
  it('formats a minute range as 12-hour time', () => {
    expect(formatTimeRange(540, 555)).toBe('9:00 AM – 9:15 AM');
    expect(formatTimeRange(14 * 60 + 30, 14 * 60 + 45)).toBe('2:30 PM – 2:45 PM');
  });

  it('formats midnight (1440 mins) and past-midnight times correctly', () => {
    expect(formatTimeRange(23 * 60 + 45, 24 * 60)).toBe('11:45 PM – 12:00 AM');
    expect(formatTimeRange(23 * 60 + 45, 24 * 60 + 15)).toBe('11:45 PM – 12:15 AM');
  });
});

describe('hexToRgba', () => {
  it('converts 6-digit hex to rgba string', () => {
    expect(hexToRgba('#1990DC', 0.13)).toBe('rgba(25, 144, 220, 0.13)');
  });

  it('converts 3-digit hex to rgba string', () => {
    expect(hexToRgba('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('falls back to color-mix for non-hex format', () => {
    expect(hexToRgba('var(--cds-layer)', 0.2)).toBe('color-mix(in srgb, var(--cds-layer) 20%, transparent)');
  });
});
