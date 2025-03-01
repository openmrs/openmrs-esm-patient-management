import React from 'react';
import { screen } from '@testing-library/react';
import { mockPatient, renderWithSwr } from 'tools';
import { useAppointments } from './appointments.resource';
import { usePastVisits } from './../past-visit/past-visit.resource';
import AppointmentDetails from './appointment-details.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockUseAppointments = jest.mocked(useAppointments);
const mockUsePastVisits = jest.mocked(usePastVisits);

jest.mock('./../past-visit/past-visit.resource', () => ({
  usePastVisits: jest.fn(),
}));

jest.mock('./appointments.resource', () => ({
  useAppointments: jest.fn(),
}));

describe('RecentandUpcomingAppointments', () => {
  it('renders no data if past and upcoming visit is empty', async () => {
    mockUseAppointments.mockReturnValueOnce({
      upcomingAppointment: null,
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUsePastVisits.mockReturnValueOnce({ visits: null, error: null, isLoading: false, isValidating: false });
    renderAppointments();

    expect(screen.getByText(/there is no last encounter to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/there is no return date to display for this patient/i)).toBeInTheDocument();
  });
});

const renderAppointments = () => {
  renderWithSwr(<AppointmentDetails {...testProps} />);
};
