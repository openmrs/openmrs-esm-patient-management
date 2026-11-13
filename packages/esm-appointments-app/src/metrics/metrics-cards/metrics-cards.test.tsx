import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockAppointmentsData } from '__mocks__';
import { type Appointment, AppointmentStatus } from '../../types';
import { useAppointmentsAppContext } from '../../hooks/useAppointmentsAppContext';
import HighestVolumeServiceExtension from './highest-volume-service.extension';
import ProvidersBookedExtension from './providers-booked.extension';
import ScheduledAppointmentsExtension from './scheduled-appointments.extension';

vi.mock('../../hooks/useAppointmentsAppContext', () => ({
  useAppointmentsAppContext: vi.fn(),
}));

vi.mock('../../hooks/useSelectedDate', () => ({
  useSelectedDate: vi.fn().mockReturnValue('2026-08-14'),
}));

const mockUseAppointmentsAppContext = vi.mocked(useAppointmentsAppContext);

const loadedAppointments = mockAppointmentsData.data as unknown as Array<Appointment>;

describe('Appointments metrics cards', () => {
  it.each([
    ['Scheduled appointments', ScheduledAppointmentsExtension],
    ['Providers booked', ProvidersBookedExtension],
    ['Highest volume service', HighestVolumeServiceExtension],
  ])('shows that the "%s" card failed to load instead of an empty count', (title, MetricsCardExtension) => {
    mockUseAppointmentsAppContext.mockReturnValue({
      appointmentForSelectedDateFilteredByServiceTypes: [],
      isLoading: false,
      error: new Error('Internal Server Error'),
    });

    render(<MetricsCardExtension />);

    expect(screen.getByText(`Failed to load ${title}`)).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows the number of scheduled appointments once they have loaded', () => {
    const [checkedIn, ...notArrived] = loadedAppointments.slice(0, 3);
    mockUseAppointmentsAppContext.mockReturnValue({
      appointmentForSelectedDateFilteredByServiceTypes: [
        { ...checkedIn, status: AppointmentStatus.CHECKEDIN },
        ...notArrived,
      ],
      isLoading: false,
      error: undefined,
    });

    render(<ScheduledAppointmentsExtension />);

    expect(screen.getByText('Scheduled appointments')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
  });

  it('shows the number of providers booked once the appointments have loaded', () => {
    mockUseAppointmentsAppContext.mockReturnValue({
      appointmentForSelectedDateFilteredByServiceTypes: loadedAppointments,
      isLoading: false,
      error: undefined,
    });

    render(<ProvidersBookedExtension />);

    const providerUuids = new Set(loadedAppointments.flatMap(({ providers }) => providers?.map(({ uuid }) => uuid)));
    expect(screen.getByText(/providers booked/i)).toBeInTheDocument();
    expect(screen.getByText(String(providerUuids.size))).toBeInTheDocument();
    expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
  });
});
