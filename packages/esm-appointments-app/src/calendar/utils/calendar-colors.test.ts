import { describe, it, expect } from 'vitest';
import {
  buildServiceColorMap,
  SERVICE_COLOR_PALETTE,
  getFallbackServiceColor,
  formatHourLabel,
} from './calendar-colors';

describe('calendar-colors utils', () => {
  describe('buildServiceColorMap', () => {
    it('assigns palette colors by index', () => {
      const map = buildServiceColorMap([{ uuid: 'service-1' }, { uuid: 'service-2' }]);

      expect(map.get('service-1')).toBe(SERVICE_COLOR_PALETTE[0]);
      expect(map.get('service-2')).toBe(SERVICE_COLOR_PALETTE[1]);
    });

    it('produces the same color for a given uuid regardless of call order', () => {
      const services = [{ uuid: 'service-1' }, { uuid: 'service-2' }];
      const map1 = buildServiceColorMap(services);
      const map2 = buildServiceColorMap(services);

      expect(map1.get('service-1')).toBe(map2.get('service-1'));
      expect(map1.get('service-2')).toBe(map2.get('service-2'));
    });

    it('falls back to a hash-derived hex color when palette is exhausted', () => {
      const services = Array.from({ length: SERVICE_COLOR_PALETTE.length + 1 }, (_, i) => ({ uuid: `svc-${i}` }));
      const map = buildServiceColorMap(services);
      const overflowColor = map.get(`svc-${SERVICE_COLOR_PALETTE.length}`);

      expect(overflowColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('returns an empty map for an empty service list', () => {
      const map = buildServiceColorMap([]);
      expect(map.size).toBe(0);
    });

    it('collapses duplicate services into a single entry', () => {
      const map = buildServiceColorMap([{ uuid: 'service-1' }, { uuid: 'service-1' }]);
      expect(map.size).toBe(1);
      expect(map.get('service-1')).toBe(SERVICE_COLOR_PALETTE[0]);
    });
  });

  describe('getFallbackServiceColor', () => {
    it('generates a consistent, valid hex color for a given service UUID', () => {
      const color1 = getFallbackServiceColor('uuid-123');
      const color2 = getFallbackServiceColor('uuid-123');
      expect(color1).toBe(color2);
      expect(color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('generates valid hex colors for various UUIDs', () => {
      const colorA = getFallbackServiceColor('uuid-alpha');
      const colorB = getFallbackServiceColor('uuid-beta');
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
