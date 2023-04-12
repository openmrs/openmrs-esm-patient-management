import React from 'react';
import { screen, render } from '@testing-library/react';
import { mockMappedAppointmentsData } from '../../../../../__mocks__/appointments.mock';
import AppointmentDetails from './appointment-details.component';

describe('AppointmentTablePatientDetails ', () => {
  it('renders a tabular view of the patient details', () => {
    renderPatientDetailsExpansionSlot();

    expect(screen.getByText(/patient details/i)).toBeInTheDocument();
    expect(screen.getByText(/appointment notes/i)).toBeInTheDocument();
    expect(screen.getByText(/appointment history/i)).toBeInTheDocument();
    expect(screen.getByText(/john wilson/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/45/i));
    expect(screen.queryAllByText(/M/i));
    expect(screen.getByText(/HIV Clinic/i)).toBeInTheDocument();
  });
});

const renderPatientDetailsExpansionSlot = () => {
  render(<AppointmentDetails appointment={mockMappedAppointmentsData.data[0]} />);
};
