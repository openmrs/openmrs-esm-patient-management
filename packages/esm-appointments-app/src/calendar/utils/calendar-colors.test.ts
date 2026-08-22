import { describe, it, expect } from 'vitest';
import { buildServiceColorMap, SERVICE_COLOR_PALETTE } from './calendar-colors';

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

  it('falls back to a hash-derived hsl color when palette is exhausted', () => {
    const services = Array.from({ length: SERVICE_COLOR_PALETTE.length + 1 }, (_, i) => ({ uuid: `svc-${i}` }));
    const map = buildServiceColorMap(services);
    const overflowColor = map.get(`svc-${SERVICE_COLOR_PALETTE.length}`);

    expect(overflowColor).toMatch(/^hsl\(/);
  });

  it('returns an empty map for an empty service list', () => {
    const map = buildServiceColorMap([]);
    expect(map.size).toBe(0);
  });
});
