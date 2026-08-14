import { describe, it, expect } from 'vitest';
import { getServiceTheme, SERVICE_COLOR_PALETTE } from './calendar-colors';

describe('calendar-colors', () => {
  it('assigns colors sequentially from the handpicked palette', () => {
    const theme1 = getServiceTheme('service-1', 'Service 1');
    const theme2 = getServiceTheme('service-2', 'Service 2');

    expect(theme1.swatch).toBe(SERVICE_COLOR_PALETTE[0]);
    expect(theme1.bg).toBe(SERVICE_COLOR_PALETTE[0] + '1a');
    expect(theme2.swatch).toBe(SERVICE_COLOR_PALETTE[1]);
    expect(theme2.bg).toBe(SERVICE_COLOR_PALETTE[1] + '1a');
  });

  it('reuses cached theme for the same service UUID', () => {
    const firstCall = getServiceTheme('service-1');
    const secondCall = getServiceTheme('service-1');

    expect(firstCall).toBe(secondCall);
  });

  it('respects custom serviceColor override', () => {
    const theme = getServiceTheme('custom-service', 'Custom Service', '#FF0000');

    expect(theme.swatch).toBe('#FF0000');
    expect(theme.bg).toBe('#FF00001a');
  });
});
