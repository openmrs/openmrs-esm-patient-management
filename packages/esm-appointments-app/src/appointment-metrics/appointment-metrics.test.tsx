import React from 'react';
import { render, screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import AppointmentMetrics from './appointment-metrics.component';
import {
  mockAppointmentMetrics,
  mockMappedAppointmentsData,
  mockProvidersCount,
  mockStartTime,
} from '../../../../__mocks__/appointments.mock';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../appointments-tabs/appointments-table.resource', () => {
  const originalModule = jest.requireActual('../appointments-tabs/appointments-table.resource');

  return {
    ...originalModule,
    useAppointments: jest.fn().mockImplementation(() => ({
      appointments: mockMappedAppointmentsData.data,
      isLoading: false,
      isValidating: false,
    })),
  };
});

jest.mock('../hooks/useClinicalMetrics', () => {
  const originalModule = jest.requireActual('../hooks/useClinicalMetrics.tsx');

  return {
    ...originalModule,
    useClinicalMetrics: jest.fn().mockImplementation(() => ({
      highestServiceLoad: mockAppointmentMetrics.highestServiceLoad,
      isLoading: mockAppointmentMetrics.isLoading,
      error: mockAppointmentMetrics.error,
    })),
    useAllAppointmentsByDate: jest.fn().mockImplementation(() => ({
      totalProviders: mockProvidersCount.totalProviders,
      isLoading: mockProvidersCount.isLoading,
      error: mockProvidersCount.error,
    })),
    useScheduledAppointment: jest.fn().mockImplementation(() => ({
      totalScheduledAppointments: mockAppointmentMetrics.totalAppointments,
    })),
    useAppointmentDate: jest.fn().mockImplementation(() => ({
      startDate: mockStartTime.startTime,
    })),
  };
});

jest.mock('../hooks/useVisits', () => {
  const originalModule = jest.requireActual('../hooks/useVisits');

  return {
    ...originalModule,
    useVisits: jest.fn().mockImplementation(() => ({
      visits: [],
      isLoading: false,
      isValidating: false,
    })),
  };
});

jest.mock('../helpers/time', () => {
  const originalModule = jest.requireActual('../helpers/time');

  return {
    ...originalModule,
    getStartDate: jest.fn().mockReturnValue(new Date()),
    useAppointmentDate: jest.fn().mockReturnValue(new Date()),
  };
});

describe('Appointment metrics', () => {
  it('renders the appointments dashboard', () => {
    mockedOpenmrsFetch.mockReturnValue({ data: mockAppointmentMetrics });

    renderAppointmentMetrics();

    expect(screen.getByRole('button', { name: /create appointment services/i })).toBeInTheDocument();
    expect(screen.getByText(/appointment metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/high volume service/i)).toBeInTheDocument();
    expect(screen.getByText(/providers available/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduled appointments/i)).toBeInTheDocument();
    expect(screen.getAllByText(/view/i));
    expect(screen.getByText(/patients/i)).toBeInTheDocument();
    expect(screen.getByText(/16/i)).toBeInTheDocument();
    expect(screen.getByText(/4/i)).toBeInTheDocument();
  });
});

function renderAppointmentMetrics() {
  render(<AppointmentMetrics />);
}
