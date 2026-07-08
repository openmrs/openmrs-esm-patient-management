import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { useExpectedAppointments } from '../hooks/useExpectedAppointments';
import ExpectedAppointments from './expected-appointments.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseExpectedAppointments = vi.mocked(useExpectedAppointments);

vi.mock('../hooks/useExpectedAppointments', () => ({
  useExpectedAppointments: vi.fn(),
}));

function mockAppointments(overrides: Partial<ReturnType<typeof useExpectedAppointments>> = {}) {
  mockUseExpectedAppointments.mockReturnValue({
    appointments: [],
    isLoading: false,
    error: undefined,
    ...overrides,
  } as ReturnType<typeof useExpectedAppointments>);
}

describe('ExpectedAppointments', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
      customPatientChartUrl: 'someUrl',
    });
  });

  it('shows a loading skeleton while fetching', () => {
    mockAppointments({ isLoading: true });
    render(<ExpectedAppointments />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows an error state distinct from an empty day', () => {
    mockAppointments({ error: new Error('down') });
    render(<ExpectedAppointments />);
    expect(screen.getByText('Error loading appointments')).toBeInTheDocument();
  });

  it('shows an empty state when there are no appointments', () => {
    mockAppointments();
    render(<ExpectedAppointments />);
    expect(screen.getByText('No appointments expected today')).toBeInTheDocument();
  });

  it('renders a row per appointment', () => {
    mockAppointments({
      appointments: [
        {
          uuid: 'a1',
          patient: { uuid: 'p1', name: 'Jane Doe' },
          service: { name: 'Consultation' },
          location: { uuid: 'loc-1' },
          startDateTime: 1700000000000,
          status: 'Scheduled',
        },
      ],
    });
    render(<ExpectedAppointments />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Consultation')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });
});
