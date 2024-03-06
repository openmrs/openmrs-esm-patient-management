import React from 'react';
import { render, screen } from '@testing-library/react';
import AppointmentsCalendarView from './appointments-calendar-view.component';

describe('Appointment calendar view', () => {
  it('renders appointments in calendar view from appointments list', async () => {
    renderAppointmentsCalendarListView();

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
  render(<AppointmentsCalendarView />);
}
