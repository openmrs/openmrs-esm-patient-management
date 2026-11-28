import { describe, it, expect } from 'vitest';
import { appointmentColumnTypes } from './constants';
import { configSchema } from './config-schema';

describe('appointmentsTableColumns config', () => {
  it('offers the appointment type column without showing it by default', () => {
    expect(appointmentColumnTypes).toContain('appointmentType');
    expect(configSchema.appointmentsTableColumns._description).toContain('appointmentType');
    expect(configSchema.appointmentsTableColumns._default).not.toContain('appointmentType');
  });
});
