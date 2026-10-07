import { describe, it, expect } from 'vitest';
import { formatWaitTimeInMinutes } from './wait-time';

describe('formatWaitTimeInMinutes', () => {
  it('always names the minutes, so a short wait does not render as an empty string', () => {
    expect(formatWaitTimeInMinutes(0)).toBe('0 minutes');
    expect(formatWaitTimeInMinutes(7)).toBe('7 minutes');
  });

  it('splits into hours and minutes', () => {
    expect(formatWaitTimeInMinutes(108)).toBe('1 hour, 48 minutes');
  });

  it('carries over into days rather than counting past 24 hours', () => {
    expect(formatWaitTimeInMinutes(30 * 60)).toBe('1 day, 6 hours, 0 minutes');
  });

  it('rounds before splitting, so it cannot produce 60 minutes', () => {
    expect(formatWaitTimeInMinutes(119.7)).toBe('2 hours, 0 minutes');
  });
});
