import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useDefineAppContext } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '__mocks__';
import { type ConfigObject, configSchema } from '../../config-schema';
import { type Appointment } from '../../types';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import ScheduledAppointments from './scheduled-appointments.component';

vi.mock('../../hooks/useAppointmentList', () => ({
  useAppointmentList: vi.fn(),
}));

vi.mock('../../hooks/useSelectedDate', () => ({
  useSelectedDate: vi.fn().mockReturnValue('2026-08-14'),
}));

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseDefineAppContext = vi.mocked(useDefineAppContext);
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

describe('ScheduledAppointments', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      customPatientChartUrl: 'url-to-patient-chart',
    });
  });

  it('shows an error state instead of an empty table when the appointments fail to load', () => {
    mockAppointmentList({ error: requestError });

    render(<ScheduledAppointments />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
    expect(screen.queryByText(/no appointments to display/i)).not.toBeInTheDocument();
    expect(mockUseDefineAppContext).toHaveBeenLastCalledWith(
      'appointments',
      expect.objectContaining({ error: requestError }),
    );
  });

  it('keeps showing the error state while the failed request is being retried', () => {
    mockAppointmentList({ error: requestError, isLoading: true });

    render(<ScheduledAppointments />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('keeps showing appointments that have already loaded when a later refresh fails', () => {
    mockAppointmentList({ appointmentList: loadedAppointments, error: requestError });

    render(<ScheduledAppointments />);

    expect(screen.getByRole('link', { name: /john wilson/i })).toBeInTheDocument();
    expect(screen.queryByText(/error state/i)).not.toBeInTheDocument();
    expect(mockUseDefineAppContext).toHaveBeenLastCalledWith(
      'appointments',
      expect.objectContaining({
        appointmentForSelectedDateFilteredByServiceTypes: loadedAppointments,
        error: undefined,
      }),
    );
  });
});
