import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentCalendar from './appointment-calendar.component';

jest.mock('../hooks/useAppointments'),
  () => ({
    useDailyAppointments: jest.fn(),
    useAppointmentsByDurationPeriod: jest.fn(),
  });

describe('Appointment calendar view', () => {
  it('renders appointments in calendar view from appointments list', async () => {
    const user = userEvent.setup();

    renderAppointmentsCalendarListView();

    expect(screen.getByText(/monthly/i)).toBeInTheDocument();

    const expectedTableRows = [
      /John Wilson 30-Aug-2021 03:35 03:35 Dr James Cook Outpatient Walk in appointments/,
      /Neil Amstrong 10-Sept-2021 03:50 03:50 Dr James Cook Outpatient Some additional notes/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.queryByRole('row', { name: new RegExp(row, 'i') })).not.toBeInTheDocument();
    });
  });
});

function renderAppointmentsCalendarListView() {
  render(<AppointmentCalendar />);
}
