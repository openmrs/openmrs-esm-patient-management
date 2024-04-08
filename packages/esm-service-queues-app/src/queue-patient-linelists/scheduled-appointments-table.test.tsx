import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockAppointmentsData } from '__mocks__';
import AppointmentsTable from './scheduled-appointments-table.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: () => ({
    appointmentStatuses: ['All', 'Scheduled', 'Completed'],
  }),
}));

jest.mock('./queue-linelist.resource', () => ({
  useAppointments: () => ({
    appointmentQueueEntries: mockAppointmentsData.data,
    isLoading: false,
  }),
}));

describe('AppointmentsTable', () => {
  it('renders appointments when loading is complete', () => {
    render(<AppointmentsTable />);

    const appointmentName = screen.getByText(/charles babbage/i);
    expect(appointmentName).toBeInTheDocument();
  });

  it('filters appointments based on status selection', async () => {
    const user = userEvent.setup();

    render(<AppointmentsTable />);

    const statusDropdown = screen.getAllByLabelText('Status:');

    await user.type(statusDropdown[0], 'Completed');

    const filteredAppointmentName = screen.getByText(/charles babbage/i);
    expect(filteredAppointmentName).toBeInTheDocument();
  });
});
