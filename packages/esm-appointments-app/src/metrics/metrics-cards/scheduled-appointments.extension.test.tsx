import React from 'react';
import { render, screen } from '@testing-library/react';
import ScheduledAppointmentsExtension from './scheduled-appointments.extension';
import { useAppointmentsStore } from '../../store';
import { useScheduledAppointments } from '../../hooks/useClinicalMetrics';
import { useAppointmentList } from '../../hooks/useAppointmentList';

jest.mock('../../store', () => ({
  useAppointmentsStore: jest.fn(),
}));

jest.mock('../../hooks/useClinicalMetrics', () => ({
  useScheduledAppointments: jest.fn(),
}));

jest.mock('../../hooks/useAppointmentList', () => ({
  useAppointmentList: jest.fn(),
}));

const mockedUseAppointmentsStore = jest.mocked(useAppointmentsStore);
const mockedUseScheduledAppointments = jest.mocked(useScheduledAppointments);
const mockedUseAppointmentList = jest.mocked(useAppointmentList);

describe('ScheduledAppointmentsExtension', () => {
  beforeEach(() => {
    mockedUseAppointmentsStore.mockReturnValue({
      appointmentServiceTypes: [],
      selectedDate: '2026-03-19',
    } as any);

    mockedUseScheduledAppointments.mockReturnValue({
      totalScheduledAppointments: 5,
      isLoading: false,
      error: undefined,
    });

    mockedUseAppointmentList.mockImplementation((status: string) => ({
      appointmentList:
        status === 'CheckedIn'
          ? [{ service: { uuid: 'service-a' } }, { service: { uuid: 'service-b' } }]
          : [
              { service: { uuid: 'service-a' } },
              { service: { uuid: 'service-c' } },
              { service: { uuid: 'service-d' } },
            ],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    }));
  });

  it('shows all appointment counts when no service filter is selected', () => {
    render(<ScheduledAppointmentsExtension />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('filters appointment counts when service filters are selected', () => {
    mockedUseAppointmentsStore.mockReturnValue({
      appointmentServiceTypes: ['service-a'],
      selectedDate: '2026-03-19',
    } as any);

    render(<ScheduledAppointmentsExtension />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
  });
});
