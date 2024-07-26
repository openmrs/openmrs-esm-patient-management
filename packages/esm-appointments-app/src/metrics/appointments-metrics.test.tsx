import React from 'react';
import { render, screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockAppointmentMetrics, mockProvidersCount, mockStartTime } from '__mocks__';
import AppointmentsMetrics from './appointments-metrics.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../hooks/useClinicalMetrics', () => ({
  ...jest.requireActual('../hooks/useClinicalMetrics'),
  useClinicalMetrics: jest.fn().mockReturnValue({
    highestServiceLoad: mockAppointmentMetrics.highestServiceLoad,
    isLoading: mockAppointmentMetrics.isLoading,
    error: mockAppointmentMetrics.error,
  }),
  useAllAppointmentsByDate: jest.fn().mockReturnValue({
    totalProviders: mockProvidersCount.totalProviders,
    isLoading: mockProvidersCount.isLoading,
    error: mockProvidersCount.error,
  }),
  useScheduledAppointment: jest.fn().mockReturnValue({
    totalScheduledAppointments: mockAppointmentMetrics.totalAppointments,
  }),
  useAppointmentDate: jest.fn().mockReturnValue({
    startDate: mockStartTime.startTime,
  }),
}));

describe('Appointment metrics', () => {
  it('renders metrics from the appointments list', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] });

    render(<AppointmentsMetrics appointmentServiceType="consultation-service-uuid" />);

    await screen.findByText(/appointment metrics/i);
    expect(screen.getByText(/scheduled appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/patients/i)).toBeInTheDocument();
    expect(screen.getByText(/16/i)).toBeInTheDocument();
    expect(screen.getByText(/4/i)).toBeInTheDocument();
  });
});
