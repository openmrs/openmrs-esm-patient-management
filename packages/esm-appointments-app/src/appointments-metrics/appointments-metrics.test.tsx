import React from 'react';
import { render, screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import AppointmentsMetrics from './appointments-metrics.component';
import { mockAppointmentMetrics } from '../../../../__mocks__/appointments.mock';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../hooks/useClinicalMetrics', () => {
  const originalModule = jest.requireActual('../hooks/useClinicalMetrics.tsx');

  return {
    ...originalModule,
    useClinicalMetrics: jest.fn().mockImplementation(() => ({
      totalAppointments: mockAppointmentMetrics.totalAppointments,
      highestServiceLoad: mockAppointmentMetrics.highestServiceLoad,
      isLoading: mockAppointmentMetrics.isLoading,
      error: mockAppointmentMetrics.error,
    })),
  };
});

describe('Appointment metrics', () => {
  it('renders metrics from appointment list', () => {
    mockedOpenmrsFetch.mockResolvedValue({ data: mockAppointmentMetrics });

    renderAppointmentMetrics();

    expect(screen.getByText(/appointment metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduled appointments/i)).toBeInTheDocument();
    expect(screen.getAllByText(/view/i));
    expect(screen.getByText(/patients/i)).toBeInTheDocument();
    expect(screen.getByText(/16/i)).toBeInTheDocument();
    expect(screen.getByText(/high volume service. today/i)).toBeInTheDocument();
    expect(screen.getByText(/providers available today/i)).toBeInTheDocument();
    expect(screen.getByText(/0/i)).toBeInTheDocument();
  });
});

function renderAppointmentMetrics() {
  render(<AppointmentsMetrics />);
}
