import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockMappedAppointmentsData } from '../../../../__mocks__/appointments.mock';
import AppointmentDetails from './appointment-details.component';
import { renderWithSwr } from '../../../../tools/test-helpers';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});

describe('AppointmentTablePatientDetails: ', () => {
  it('renders a tabular view of the patient details', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: mockMappedAppointmentsData } });

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

function renderPatientDetailsExpansionSlot() {
  renderWithSwr(<AppointmentDetails appointment={mockMappedAppointmentsData.data[0]} />);
}
