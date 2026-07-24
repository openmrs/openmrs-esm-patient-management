import { describe, it, expect } from 'vitest';
import i18next from 'i18next';
import { formatDuration, getWaitTimeInMinutes } from './queue-duration.component';

// The shared react-i18next test mock does not implement pluralization, so formatDuration is
// exercised against a real i18next instance loaded with the app's English plural keys. Polish
// (one/few/many) is included to prove the keys support locales with more than two plural forms,
// which the previous "(s)" strings could not express.
const i18n = i18next.createInstance();
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  initImmediate: false,
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        queueDurationHoursAndMinutes: '{{hours}} and {{minutes}}',
        queueDurationHours_one: '{{count}} hour',
        queueDurationHours_other: '{{count}} hours',
        queueDurationMinutes_one: '{{count}} minute',
        queueDurationMinutes_other: '{{count}} minutes',
      },
    },
    pl: {
      translation: {
        queueDurationHoursAndMinutes: '{{hours}} i {{minutes}}',
        queueDurationHours_one: '{{count}} godzina',
        queueDurationHours_few: '{{count}} godziny',
        queueDurationHours_many: '{{count}} godzin',
        queueDurationMinutes_one: '{{count}} minuta',
        queueDurationMinutes_few: '{{count}} minuty',
        queueDurationMinutes_many: '{{count}} minut',
      },
    },
  },
});

describe('getWaitTimeInMinutes', () => {
  const now = new Date('2025-01-01T12:00:00Z');

  it('returns the minutes elapsed since startedAt', () => {
    expect(getWaitTimeInMinutes(new Date('2025-01-01T10:30:00Z'), undefined, now)).toBe(90);
  });

  it('clamps to 0 when startedAt is in the future', () => {
    expect(getWaitTimeInMinutes(new Date('2025-01-01T14:00:00Z'), undefined, now)).toBe(0);
  });

  it('measures up to endedAt when provided, ignoring now', () => {
    expect(getWaitTimeInMinutes(new Date('2025-01-01T10:00:00Z'), new Date('2025-01-01T11:00:00Z'), now)).toBe(60);
  });
});

describe('formatDuration', () => {
  const t = i18n.getFixedT('en');

  it('pluralizes minutes when under an hour', () => {
    expect(formatDuration(t, 0)).toBe('0 minutes');
    expect(formatDuration(t, 1)).toBe('1 minute');
    expect(formatDuration(t, 45)).toBe('45 minutes');
  });

  it('pluralizes hours and minutes together', () => {
    expect(formatDuration(t, 60)).toBe('1 hour and 0 minutes');
    expect(formatDuration(t, 61)).toBe('1 hour and 1 minute');
    expect(formatDuration(t, 150)).toBe('2 hours and 30 minutes');
  });

  it('selects the right plural form for locales with more than two forms', () => {
    const pl = i18n.getFixedT('pl');
    expect(formatDuration(pl, 1)).toBe('1 minuta'); // one
    expect(formatDuration(pl, 2)).toBe('2 minuty'); // few
    expect(formatDuration(pl, 5)).toBe('5 minut'); // many
    expect(formatDuration(pl, 125)).toBe('2 godziny i 5 minut');
  });
});
