import { describe, it, expect } from 'vitest';
import { generateMockAppointments } from './mock-appointments';
import { buildHourSlots, buildTimelineRanges } from './day-timeline';
import { AppointmentStatus } from '../../types';

describe('generateMockAppointments', () => {
  it('generates a full weekday schedule (2026-06-09 is a Tuesday)', () => {
    const appointments = generateMockAppointments('2026-06-09');
    expect(appointments.length).toBe(24);
    expect(appointments.every((a) => a.startDateTime != null && a.endDateTime != null)).toBe(true);
  });

  it('returns an empty schedule on Sunday', () => {
    expect(generateMockAppointments('2026-06-07')).toEqual([]);
  });

  it('returns a light schedule on Saturday', () => {
    expect(generateMockAppointments('2026-06-13')).toHaveLength(3);
  });

  it('puts the 14:00 hour over the legibility ceiling to trigger the summary block', () => {
    const slots = buildHourSlots(generateMockAppointments('2026-06-09'));
    const slot14 = slots.find((s) => s.hour === 14);
    expect(slot14?.peak).toBe(7);
    expect(slot14?.exceedsCeiling).toBe(true);
  });

  it('renders the 5-minute evening pair in side-by-side lanes', () => {
    const slots = buildHourSlots(generateMockAppointments('2026-06-09'));
    const slot18 = slots.find((s) => s.hour === 18);
    expect(slot18?.blocks).toHaveLength(2);
    expect(slot18?.blocks[0].lane).toBe(0);
    expect(slot18?.blocks[1].lane).toBe(1);
    expect(slot18?.blocks[0].heightPx).toBe(26);
  });

  it('covers a spread of statuses for visual checking', () => {
    const statuses = new Set(generateMockAppointments('2026-06-09').map((a) => a.status));
    expect(statuses.has(AppointmentStatus.SCHEDULED)).toBe(true);
    expect(statuses.has(AppointmentStatus.CHECKEDIN)).toBe(true);
    expect(statuses.has(AppointmentStatus.COMPLETED)).toBe(true);
    expect(statuses.has(AppointmentStatus.CANCELLED)).toBe(true);
    expect(statuses.has(AppointmentStatus.MISSED)).toBe(true);
  });

  it('leaves empty ranges to collapse on a weekday', () => {
    const ranges = buildTimelineRanges(generateMockAppointments('2026-06-09'));
    expect(ranges.filter((r) => r.kind === 'empty')).toEqual([{ kind: 'empty', h0: 17, h1: 17 }]);
  });
});
