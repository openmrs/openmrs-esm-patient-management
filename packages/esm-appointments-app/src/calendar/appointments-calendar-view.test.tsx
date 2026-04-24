import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar-view.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';

jest.mock('../hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: jest.fn().mockReturnValue({ calendarEvents: [], isLoading: false, error: null }),
}));

const mockUseAppointmentsCalendar = jest.mocked(useAppointmentsCalendar);

function renderCalendar() {
  return render(
    <BrowserRouter>
      <AppointmentsCalendarView />
    </BrowserRouter>,
  );
}

function latestRequestedDate() {
  const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
  return dayjs(lastCall?.[0]);
}

describe('Appointment calendar view', () => {
  it('renders the calendar view with Prev and Next controls', () => {
    renderCalendar();
    expect(screen.getByTestId('appointments-calendar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  it('advances the calendar by one month when Next is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();
    const initialDate = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /next month/i }));

    expect(latestRequestedDate().diff(initialDate, 'month')).toBe(1);
  });

  it('rewinds the calendar by one month when Prev is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();
    const initialDate = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /previous month/i }));

    expect(initialDate.diff(latestRequestedDate(), 'month')).toBe(1);
  });
});
