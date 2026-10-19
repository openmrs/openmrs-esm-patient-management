import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type Appointment } from '../types';
import { usePatientAppointments } from './patient-appointments.resource';
import PatientUpcomingAppointmentsCard from './patient-upcoming-appointments-card.component';

vi.mock('./patient-appointments.resource', () => ({
  usePatientAppointments: vi.fn(),
  changeAppointmentStatus: vi.fn(),
}));

vi.mock('../hooks/useMutateAppointments', () => ({
  useMutateAppointments: () => ({ mutateAppointments: vi.fn() }),
}));

const mockUsePatientAppointments = vi.mocked(usePatientAppointments);

const buildAppointment = (overrides: Partial<Appointment>): Appointment =>
  ({
    uuid: 'appointment-uuid',
    status: 'Scheduled',
    startDateTime: new Date().setHours(23, 0, 0, 0),
    service: { name: 'Outpatient' },
    ...overrides,
  }) as Appointment;

const testProps = {
  patientUuid: 'patient-uuid',
  setVisitFormCallbacks: vi.fn(),
  visitFormOpenedFrom: 'test',
  patientChartConfig: { showUpcomingAppointments: true },
};

describe('PatientUpcomingAppointmentsCard', () => {
  beforeEach(() => {
    mockUsePatientAppointments.mockReset();
  });

  it('renders an appointment occurring later today exactly once', () => {
    // The resource hook places a later-today appointment in todaysAppointments only (not
    // upcomingAppointments), so the card receives it once and renders a single row.
    const laterToday = buildAppointment({ uuid: 'later-today' });

    mockUsePatientAppointments.mockReturnValue({
      data: {
        todaysAppointments: [laterToday],
        upcomingAppointments: [],
        pastAppointments: [],
      },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<PatientUpcomingAppointmentsCard {...testProps} />);

    // One row → one radio button.
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('renders distinct appointments without collapsing them', () => {
    const today = buildAppointment({ uuid: 'today' });
    const future = buildAppointment({
      uuid: 'future',
      startDateTime: new Date(new Date().setDate(new Date().getDate() + 2)).getTime(),
    });

    mockUsePatientAppointments.mockReturnValue({
      data: {
        todaysAppointments: [today],
        upcomingAppointments: [future],
        pastAppointments: [],
      },
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<PatientUpcomingAppointmentsCard {...testProps} />);

    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
});
