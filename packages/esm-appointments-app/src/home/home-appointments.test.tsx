import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '__mocks__';
import { type ConfigObject, configSchema } from '../config-schema';
import { type Appointment } from '../types';
import { useAppointmentList } from '../hooks/useAppointmentList';
import HomeAppointments from './home-appointments.component';

vi.mock('../hooks/useAppointmentList', () => ({
  useAppointmentList: vi.fn(),
}));

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseAppointmentList = vi.mocked(useAppointmentList);

const loadedAppointments = mockAppointmentsData.data as unknown as Array<Appointment>;
const requestError = new Error('Internal Server Error');

function mockAppointmentList(response: Partial<ReturnType<typeof useAppointmentList>>) {
  mockUseAppointmentList.mockReturnValue({
    appointmentList: [],
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...response,
  });
}

describe('HomeAppointments', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      customPatientChartUrl: 'url-to-patient-chart',
    });
  });

  it("shows an error state instead of an empty table when today's appointments fail to load", () => {
    mockAppointmentList({ error: requestError });

    render(<HomeAppointments />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
    expect(screen.queryByText(/no appointments to display/i)).not.toBeInTheDocument();
  });

  it('keeps showing appointments that have already loaded when a later refresh fails', () => {
    mockAppointmentList({ appointmentList: loadedAppointments, error: requestError });

    render(<HomeAppointments />);

    expect(screen.getByRole('link', { name: /john wilson/i })).toBeInTheDocument();
    expect(screen.queryByText(/error state/i)).not.toBeInTheDocument();
  });
});
