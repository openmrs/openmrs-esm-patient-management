import { AppointmentStatus } from '../types';
import { canTransition } from './functions';

describe('canTransition', () => {
  // Forward transitions (should be allowed)
  it.each([
    [AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKEDIN],
    [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
    [AppointmentStatus.SCHEDULED, AppointmentStatus.CANCELLED],
    [AppointmentStatus.SCHEDULED, AppointmentStatus.MISSED],
    [AppointmentStatus.CHECKEDIN, AppointmentStatus.COMPLETED],
    [AppointmentStatus.CHECKEDIN, AppointmentStatus.CANCELLED],
    [AppointmentStatus.CHECKEDIN, AppointmentStatus.MISSED],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  // Backward to Scheduled (should be allowed)
  it.each([
    [AppointmentStatus.CHECKEDIN, AppointmentStatus.SCHEDULED],
    [AppointmentStatus.COMPLETED, AppointmentStatus.SCHEDULED],
    [AppointmentStatus.CANCELLED, AppointmentStatus.SCHEDULED],
    [AppointmentStatus.MISSED, AppointmentStatus.SCHEDULED],
  ])('allows %s -> Scheduled', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  // Terminal to terminal (should be blocked)
  it.each([
    [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
    [AppointmentStatus.COMPLETED, AppointmentStatus.MISSED],
    [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED],
    [AppointmentStatus.CANCELLED, AppointmentStatus.MISSED],
    [AppointmentStatus.MISSED, AppointmentStatus.COMPLETED],
    [AppointmentStatus.MISSED, AppointmentStatus.CANCELLED],
  ])('blocks %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  // Backward non-Scheduled transitions (should be blocked)
  it.each([
    [AppointmentStatus.CHECKEDIN, AppointmentStatus.CHECKEDIN],
    [AppointmentStatus.COMPLETED, AppointmentStatus.CHECKEDIN],
    [AppointmentStatus.CANCELLED, AppointmentStatus.CHECKEDIN],
    [AppointmentStatus.MISSED, AppointmentStatus.CHECKEDIN],
  ])('blocks %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  // Same status (except Scheduled -> Scheduled which is allowed by the rule)
  it('allows Scheduled -> Scheduled', () => {
    expect(canTransition(AppointmentStatus.SCHEDULED, AppointmentStatus.SCHEDULED)).toBe(true);
  });
});
