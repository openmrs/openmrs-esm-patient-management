import { describe, it, expect } from 'vitest';
import {
  buildServiceColorMap,
  SERVICE_COLOR_PALETTE,
  getFallbackServiceColor,
  formatHourLabel,
} from './calendar-colors';

describe('calendar-colors utils', () => {
  const OUTPATIENT_SERVICE_UUID = 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90';
  const HIV_CLINIC_SERVICE_UUID = '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1';
  const TB_CLINIC_SERVICE_UUID = '4a228e52-0bfe-11ed-861d-0242ac120002';

  describe('buildServiceColorMap', () => {
    it('assigns palette colors by index', () => {
      const map = buildServiceColorMap([{ uuid: OUTPATIENT_SERVICE_UUID }, { uuid: HIV_CLINIC_SERVICE_UUID }]);

      expect(map.get(OUTPATIENT_SERVICE_UUID)).toBe(SERVICE_COLOR_PALETTE[0]);
      expect(map.get(HIV_CLINIC_SERVICE_UUID)).toBe(SERVICE_COLOR_PALETTE[1]);
    });

    it('produces the same color for a given uuid regardless of call order', () => {
      const services = [{ uuid: OUTPATIENT_SERVICE_UUID }, { uuid: HIV_CLINIC_SERVICE_UUID }];
      const map1 = buildServiceColorMap(services);
      const map2 = buildServiceColorMap(services);

      expect(map1.get(OUTPATIENT_SERVICE_UUID)).toBe(map2.get(OUTPATIENT_SERVICE_UUID));
      expect(map1.get(HIV_CLINIC_SERVICE_UUID)).toBe(map2.get(HIV_CLINIC_SERVICE_UUID));
    });

    it('falls back to a hash-derived hex color when palette is exhausted', () => {
      const makeUuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
      const services = Array.from({ length: SERVICE_COLOR_PALETTE.length + 1 }, (_, i) => ({ uuid: makeUuid(i) }));
      const map = buildServiceColorMap(services);
      const overflowColor = map.get(makeUuid(SERVICE_COLOR_PALETTE.length));

      expect(overflowColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('returns an empty map for an empty service list', () => {
      const map = buildServiceColorMap([]);
      expect(map.size).toBe(0);
    });

    it('collapses duplicate services into a single entry', () => {
      const map = buildServiceColorMap([{ uuid: OUTPATIENT_SERVICE_UUID }, { uuid: OUTPATIENT_SERVICE_UUID }]);
      expect(map.size).toBe(1);
      expect(map.get(OUTPATIENT_SERVICE_UUID)).toBe(SERVICE_COLOR_PALETTE[0]);
    });
  });

  describe('getFallbackServiceColor', () => {
    it('generates a consistent, valid hex color for a given service UUID', () => {
      const color1 = getFallbackServiceColor(OUTPATIENT_SERVICE_UUID);
      const color2 = getFallbackServiceColor(OUTPATIENT_SERVICE_UUID);
      expect(color1).toBe(color2);
      expect(color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('generates valid hex colors for various UUIDs', () => {
      const colorA = getFallbackServiceColor(HIV_CLINIC_SERVICE_UUID);
      const colorB = getFallbackServiceColor(TB_CLINIC_SERVICE_UUID);
      expect(colorA).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colorB).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('formatHourLabel', () => {
    it('formats midnight as 12 AM', () => {
      expect(formatHourLabel(0)).toBe('12 AM');
    });

    it('formats noon as 12 PM', () => {
      expect(formatHourLabel(12)).toBe('12 PM');
    });

    it('formats 1 PM (hour 13) correctly', () => {
      expect(formatHourLabel(13)).toBe('1 PM');
    });

    it('formats 11 PM (hour 23) correctly', () => {
      expect(formatHourLabel(23)).toBe('11 PM');
    });

    it('formats morning hours correctly', () => {
      expect(formatHourLabel(9)).toBe('9 AM');
    });
  });
});
