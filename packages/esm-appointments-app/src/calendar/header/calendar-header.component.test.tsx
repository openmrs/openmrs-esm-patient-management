import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { appointmentsStore } from '../../store';
import { omrsDateFormat } from '../../constants';
import CalendarHeader from './calendar-header.component';

function setupStore(calendarView: 'monthly' | 'weekly' | 'daily' = 'monthly') {
  appointmentsStore.setState({
    selectedDate: dayjs('2024-01-15').format(omrsDateFormat),
    calendarView,
    appointmentServiceTypes: [],
  });
}

describe('CalendarHeader', () => {
  beforeEach(() => setupStore());

  it('renders Monthly, Weekly and Daily tabs', () => {
    render(<CalendarHeader />);

    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
  });

  it('renders a Back button', () => {
    render(<CalendarHeader />);

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('switches to weekly view when the Weekly tab is clicked', async () => {
    const user = userEvent.setup();
    render(<CalendarHeader />);

    await user.click(screen.getByText('Weekly'));

    expect(appointmentsStore.getState().calendarView).toBe('weekly');
  });

  it('switches to daily view when the Daily tab is clicked', async () => {
    const user = userEvent.setup();
    render(<CalendarHeader />);

    await user.click(screen.getByText('Daily'));

    expect(appointmentsStore.getState().calendarView).toBe('daily');
  });

  it('switches back to monthly view when the Monthly tab is clicked', async () => {
    const user = userEvent.setup();
    setupStore('weekly');
    render(<CalendarHeader />);

    await user.click(screen.getByText('Monthly'));

    expect(appointmentsStore.getState().calendarView).toBe('monthly');
  });
});
