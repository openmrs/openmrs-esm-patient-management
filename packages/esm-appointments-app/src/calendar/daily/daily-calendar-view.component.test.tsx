import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { appointmentsStore } from '../../store';
import { omrsDateFormat } from '../../constants';
import { type DailyAppointmentsCountByService } from '../../types';
import DailyCalendarView from './daily-calendar-view.component';

const SELECTED_DATE = '2024-01-15'; // Monday

const mockEvents: Array<DailyAppointmentsCountByService> = [
  {
    appointmentDate: SELECTED_DATE,
    services: [
      { serviceName: 'HIV Clinic', serviceUuid: 'uuid-hiv', count: 4 },
      { serviceName: 'TB Clinic', serviceUuid: 'uuid-tb', count: 1 },
    ],
  },
];

function setupStore(date = SELECTED_DATE) {
  appointmentsStore.setState({
    selectedDate: dayjs(date).format(omrsDateFormat),
    calendarView: 'daily',
    appointmentServiceTypes: [],
  });
}

describe('DailyCalendarView', () => {
  beforeEach(() => setupStore());

  it('renders Prev and Next day navigation buttons', () => {
    render(<DailyCalendarView events={[]} />);

    expect(screen.getByRole('button', { name: /previous day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next day/i })).toBeInTheDocument();
  });

  it('shows no appointments message when there are no events for the selected day', () => {
    render(<DailyCalendarView events={[]} />);

    expect(screen.getByText(/no appointments scheduled for this day/i)).toBeInTheDocument();
  });

  it('shows the service table when events exist for the selected date', () => {
    render(<DailyCalendarView events={mockEvents} />);

    expect(screen.getByText('HIV Clinic')).toBeInTheDocument();
    expect(screen.getByText('TB Clinic')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows total appointment count', () => {
    render(<DailyCalendarView events={mockEvents} />);

    expect(screen.getByText(/total appointments/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // 4 + 1
  });

  it('shows Today badge when the selected date is today', () => {
    setupStore(dayjs().format('YYYY-MM-DD'));
    render(<DailyCalendarView events={[]} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('does not show Today badge for a past date', () => {
    render(<DailyCalendarView events={[]} />);

    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('opens a modal when a service row is clicked', async () => {
    const user = userEvent.setup();
    render(<DailyCalendarView events={mockEvents} />);

    await user.click(screen.getByText('HIV Clinic'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal contains service details', async () => {
    const user = userEvent.setup();
    render(<DailyCalendarView events={mockEvents} />);

    await user.click(screen.getByText('HIV Clinic'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('HIV Clinic');
    expect(dialog).toHaveTextContent('TB Clinic');
  });

  it('navigates to the previous day when Prev is clicked', async () => {
    const user = userEvent.setup();
    render(<DailyCalendarView events={[]} />);

    await user.click(screen.getByRole('button', { name: /previous day/i }));

    const newDate = dayjs(appointmentsStore.getState().selectedDate);
    expect(newDate.format('YYYY-MM-DD')).toBe('2024-01-14');
  });

  it('navigates to the next day when Next is clicked', async () => {
    const user = userEvent.setup();
    render(<DailyCalendarView events={[]} />);

    await user.click(screen.getByRole('button', { name: /next day/i }));

    const newDate = dayjs(appointmentsStore.getState().selectedDate);
    expect(newDate.format('YYYY-MM-DD')).toBe('2024-01-16');
  });
});
