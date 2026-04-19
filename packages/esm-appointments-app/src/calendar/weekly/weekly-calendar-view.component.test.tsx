import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { appointmentsStore } from '../../store';
import { omrsDateFormat } from '../../constants';
import { type DailyAppointmentsCountByService } from '../../types';
import WeeklyCalendarView from './weekly-calendar-view.component';

// 2024-01-15 is a Monday; week runs Sun 2024-01-14 to Sat 2024-01-20
const SELECTED_DATE = '2024-01-15';

const mockEvents: Array<DailyAppointmentsCountByService> = [
  {
    appointmentDate: '2024-01-16', // Tuesday
    services: [
      { serviceName: 'HIV Clinic', serviceUuid: 'uuid-hiv', count: 3 },
      { serviceName: 'TB Clinic', serviceUuid: 'uuid-tb', count: 2 },
    ],
  },
];

function setupStore() {
  appointmentsStore.setState({
    selectedDate: dayjs(SELECTED_DATE).format(omrsDateFormat),
    calendarView: 'weekly',
    appointmentServiceTypes: [],
  });
}

describe('WeeklyCalendarView', () => {
  beforeEach(() => setupStore());

  it('renders all 7 day column headers', () => {
    render(<WeeklyCalendarView events={[]} />);

    expect(screen.getByText('SUN')).toBeInTheDocument();
    expect(screen.getByText('MON')).toBeInTheDocument();
    expect(screen.getByText('TUE')).toBeInTheDocument();
    expect(screen.getByText('WED')).toBeInTheDocument();
    expect(screen.getByText('THU')).toBeInTheDocument();
    expect(screen.getByText('FRI')).toBeInTheDocument();
    expect(screen.getByText('SAT')).toBeInTheDocument();
  });

  it('renders Prev and Next navigation buttons', () => {
    render(<WeeklyCalendarView events={[]} />);

    expect(screen.getByRole('button', { name: /previous week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next week/i })).toBeInTheDocument();
  });

  it('displays service names and counts for days with appointments', () => {
    render(<WeeklyCalendarView events={mockEvents} />);

    expect(screen.getByText('HIV Clinic')).toBeInTheDocument();
    expect(screen.getByText('TB Clinic')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows no appointments text for empty days', () => {
    render(<WeeklyCalendarView events={[]} />);

    const emptyCells = screen.getAllByText('No appointments');
    expect(emptyCells.length).toBe(7);
  });

  it('shows a modal when a day cell with appointments is clicked', async () => {
    const user = userEvent.setup();
    render(<WeeklyCalendarView events={mockEvents} />);

    await user.click(screen.getByText('HIV Clinic'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('navigates to the previous week when Prev is clicked', async () => {
    const user = userEvent.setup();
    render(<WeeklyCalendarView events={[]} />);

    await user.click(screen.getByRole('button', { name: /previous week/i }));

    const newDate = dayjs(appointmentsStore.getState().selectedDate);
    expect(newDate.isBefore(dayjs(SELECTED_DATE))).toBe(true);
  });

  it('navigates to the next week when Next is clicked', async () => {
    const user = userEvent.setup();
    render(<WeeklyCalendarView events={[]} />);

    await user.click(screen.getByRole('button', { name: /next week/i }));

    const newDate = dayjs(appointmentsStore.getState().selectedDate);
    expect(newDate.isAfter(dayjs(SELECTED_DATE))).toBe(true);
  });
});
