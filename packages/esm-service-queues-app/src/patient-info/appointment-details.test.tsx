import React from 'react';
import { screen } from '@testing-library/react';
import { mockPatient, renderWithSwr } from 'tools';
import AppointmentDetails from './appointment-details.component';
import { usePastVisits } from './../past-visit/past-visit.resource';
import { useAppointments } from './appointments.resource';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockUseAppointments = useAppointments as jest.Mock;
const mockUsePastVisits = usePastVisits as jest.Mock;

jest.mock('./../past-visit/past-visit.resource', () => ({
  usePastVisits: jest.fn(),
}));

jest.mock('./appointments.resource', () => ({
  useAppointments: jest.fn(),
}));

describe('RecentandUpcomingAppointments', () => {
  it('renders no data if past and upcoming visit is empty', async () => {
    mockUseAppointments.mockReturnValueOnce({ data: [] });
    mockUsePastVisits.mockReturnValueOnce({ data: [] });
    renderAppointments();

    expect(screen.getByText(/there is no last encounter to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/there is no return date to display for this patient/i)).toBeInTheDocument();
  });
});

const renderAppointments = () => {
  renderWithSwr(<AppointmentDetails {...testProps} />);
};
