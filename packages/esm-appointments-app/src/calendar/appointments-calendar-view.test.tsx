import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { getDefaultCalendar } from '@openmrs/esm-framework';
import AppointmentsCalendarView from './appointments-calendar-view.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getDefaultCalendar: vi.fn(),
}));

vi.mock('../hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: vi.fn().mockReturnValue({ calendarEvents: [], isLoading: false, error: null }),
}));

vi.mock('../hooks/useAppointmentsByDate', () => ({
  useAppointmentsByDate: vi.fn().mockReturnValue({ appointments: [], isLoading: false }),
}));

vi.mock('../hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn().mockReturnValue({
    serviceTypes: [{ uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', name: 'HIV Clinic' }],
    isLoading: false,
    error: null,
  }),
}));

const mockGetDefaultCalendar = vi.mocked(getDefaultCalendar);
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

  it('renders the Monthly and Daily view switcher', () => {
    renderCalendar();
    expect(screen.getByRole('tab', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /daily/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /weekly/i })).not.toBeInTheDocument();
  });

  it('defaults to monthly period on initial render', () => {
    renderCalendar();
    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('monthly');
  });

  it('switches to daily period when Daily tab is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));

    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('daily');
  });

  it('advances by 1 day when Next is clicked in daily mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    const dateBeforeNav = latestRequestedDate();

    await user.click(screen.getByRole('tab', { name: /daily/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('tab', { name: /monthly/i }));

    expect(latestRequestedDate().diff(dateBeforeNav, 'day')).toBe(1);
  });

  it('rewinds by 1 day when Prev is clicked in daily mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    const dateBeforeNav = latestRequestedDate();

    await user.click(screen.getByRole('tab', { name: /daily/i }));
    await user.click(screen.getByRole('button', { name: /previous/i }));
    await user.click(screen.getByRole('tab', { name: /monthly/i }));

    expect(dateBeforeNav.diff(latestRequestedDate(), 'day')).toBe(1);
  });

  it('displays month and year title in monthly mode', () => {
    renderCalendar();
    expect(screen.getByText(/^[A-Z][a-z]+ \d{4}$/)).toBeInTheDocument();
  });

  it('opens popup when a day cell with appointments is clicked in monthly mode, then switches to daily view when Open day view is clicked', async () => {
    const user = userEvent.setup();
    const today = dayjs().format('YYYY-MM-DD');
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: today,
          services: [{ serviceName: 'Outpatient', serviceUuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', count: 5 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    await user.click(screen.getAllByText('Outpatient')[0]);

    const openDayViewBtn = screen.getAllByRole('button', { name: /open day view/i })[0];
    expect(openDayViewBtn).toBeInTheDocument();
    await user.click(openDayViewBtn);

    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('daily');
  });

  it('renders the services legend when services are present', () => {
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: '2026-08-14',
          services: [{ serviceName: 'HIV Clinic', serviceUuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', count: 3 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getAllByText('HIV Clinic').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the same color for a service in both legend and monthly views', () => {
    const today = dayjs().format('YYYY-MM-DD');
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: today,
          services: [{ serviceName: 'HIV Clinic', serviceUuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', count: 3 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    const legendSwatch = screen.getByTestId('legend-swatch-53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1');
    const cellSwatch = screen.getByTestId('service-swatch-53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1');

    expect(legendSwatch).toBeInTheDocument();
    expect(cellSwatch).toBeInTheDocument();
    expect(legendSwatch.style.backgroundColor).toBeTruthy();
    expect(legendSwatch.style.backgroundColor).toBe(cellSwatch.style.backgroundColor);
  });

  describe('when the locale uses the Ethiopic calendar', () => {
    beforeEach(() => {
      mockGetDefaultCalendar.mockReturnValue('ethiopic');
    });

    it('shows the Ethiopic month and its days, and moves by Ethiopic months', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/2026-06-15']}>
          <Routes>
            <Route path="/:date" element={<AppointmentsCalendarView />} />
          </Routes>
        </MemoryRouter>,
      );

      // 15 June 2026 is Sene 8, 2018 in the Ethiopic calendar. Sene 2018 runs from 8 June to 7 July 2026.
      expect(screen.getByText('Sene 2018')).toBeInTheDocument();
      expect(within(screen.getByTestId('workload-cell-2026-06-08')).getByTestId('current-month-day')).toHaveTextContent(
        '1',
      );
      expect(within(screen.getByTestId('workload-cell-2026-07-07')).getByTestId('current-month-day')).toHaveTextContent(
        '30',
      );
      expect(within(screen.getByTestId('workload-cell-2026-06-07')).getByTestId('other-month-day')).toHaveTextContent(
        '30',
      );

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Hamle 8, 2018
      expect(latestRequestedDate().format('YYYY-MM-DD')).toBe('2026-07-15');
      expect(screen.getByText('Hamle 2018')).toBeInTheDocument();
    });
  });
});
