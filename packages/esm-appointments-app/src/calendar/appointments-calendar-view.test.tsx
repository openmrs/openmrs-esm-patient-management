import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar-view.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';

vi.mock('../hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: vi.fn().mockReturnValue({ calendarEvents: [], isLoading: false, error: null }),
}));

vi.mock('../hooks/useAppointmentsByDate', () => ({
  useAppointmentsByDate: vi.fn().mockReturnValue({ appointments: [], isLoading: false }),
}));

const mockUseAppointmentsCalendar = vi.mocked(useAppointmentsCalendar);

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
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('advances the calendar by one month when Next is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();
    const initialDate = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(latestRequestedDate().diff(initialDate, 'month')).toBe(1);
  });

  it('rewinds the calendar by one month when Prev is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();
    const initialDate = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(initialDate.diff(latestRequestedDate(), 'month')).toBe(1);
  });

  it('renders the Monthly, Weekly, Daily view switcher', () => {
    renderCalendar();
    expect(screen.getByRole('tab', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /weekly/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /daily/i })).toBeInTheDocument();
  });

  it('defaults to monthly period on initial render', () => {
    renderCalendar();
    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('monthly');
  });

  it('switches to weekly period when Weekly tab is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /weekly/i }));

    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('weekly');
  });

  it('switches to daily period when Daily tab is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));

    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('daily');
  });

  it('advances by 7 days when Next is clicked in weekly mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /weekly/i }));
    const dateBefore = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(latestRequestedDate().diff(dateBefore, 'day')).toBe(7);
  });

  it('rewinds by 7 days when Prev is clicked in weekly mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /weekly/i }));
    const dateBefore = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(dateBefore.diff(latestRequestedDate(), 'day')).toBe(7);
  });

  it('advances by 1 day when Next is clicked in daily mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));
    const dateBefore = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(latestRequestedDate().diff(dateBefore, 'day')).toBe(1);
  });

  it('rewinds by 1 day when Prev is clicked in daily mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));
    const dateBefore = latestRequestedDate();

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(dateBefore.diff(latestRequestedDate(), 'day')).toBe(1);
  });

  it('displays month and year title in monthly mode', () => {
    renderCalendar();
    expect(screen.getByText(/^[A-Z][a-z]+ \d{4}$/)).toBeInTheDocument();
  });

  it('displays week range title in weekly mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /weekly/i }));

    expect(screen.getByText(/\w{3} \d{1,2} – \w{3} \d{1,2}, \d{4}/)).toBeInTheDocument();
  });

  it('displays full date title in daily mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));

    const titles = screen.getAllByText(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });
});
