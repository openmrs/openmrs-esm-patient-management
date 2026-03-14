import dayjs from 'dayjs';
import { AppointmentStatus } from '../types';
import { canTransition, isSameMonth, weekDays } from './functions';

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

describe('weekDays', () => {
  it('returns 7 days starting from Sunday of the given week', () => {
    // 2024-01-15 is a Monday
    const date = dayjs('2024-01-15');
    const days = weekDays(date);

    expect(days).toHaveLength(7);
    expect(days[0].day()).toBe(0); // Sunday
    expect(days[6].day()).toBe(6); // Saturday
  });

  it('returns the correct week range for a given date', () => {
    const date = dayjs('2024-01-15'); // Monday
    const days = weekDays(date);

    expect(days[0].format('YYYY-MM-DD')).toBe('2024-01-14'); // Sunday
    expect(days[6].format('YYYY-MM-DD')).toBe('2024-01-20'); // Saturday
  });

  it('returns consecutive days', () => {
    const days = weekDays(dayjs('2024-03-01'));
    for (let i = 1; i < days.length; i++) {
      expect(days[i].diff(days[i - 1], 'day')).toBe(1);
    }
  });
});

describe('isSameMonth', () => {
  it('returns true for two dates in the same month', () => {
    expect(isSameMonth(dayjs('2024-03-05'), dayjs('2024-03-20'))).toBe(true);
  });

  it('returns false for dates in different months', () => {
    expect(isSameMonth(dayjs('2024-03-31'), dayjs('2024-04-01'))).toBe(false);
  });

  it('returns false for dates in the same day but different years', () => {
    expect(isSameMonth(dayjs('2023-03-15'), dayjs('2024-03-15'))).toBe(false);
  });
});
