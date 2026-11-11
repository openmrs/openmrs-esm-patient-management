import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useLocations } from '@openmrs/esm-framework';
import { mockLocationInpatientWard, mockLocationMosoriot } from '__mocks__';
import AppointmentsCalendarView from './appointments-calendar-view.component';
import { useAppointmentsByDate } from '../hooks/useAppointmentsByDate';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { type Appointment } from '../types';

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

const mockUseAppointmentsByDate = vi.mocked(useAppointmentsByDate);
const mockUseAppointmentsCalendar = vi.mocked(useAppointmentsCalendar);
const mockUseLocations = vi.mocked(useLocations);

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

  it('narrows the calendar to the selected locations and shows everything again once the filter is cleared', async () => {
    const user = userEvent.setup();
    mockUseLocations.mockReturnValue([mockLocationMosoriot, mockLocationInpatientWard]);
    mockUseAppointmentsByDate.mockReturnValue({
      appointments: [
        {
          uuid: '3b4d4f2a-7c8d-4e1f-9a6b-5c8d2e1f4a7b',
          location: { uuid: mockLocationMosoriot.uuid, name: mockLocationMosoriot.name },
          patient: { identifier: '100GEJ', name: 'John Wilson', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          service: { name: 'HIV Clinic', uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1' },
          startDateTime: dayjs().hour(9).valueOf(),
          status: 'Scheduled',
        },
        {
          uuid: '5c6e8f1b-9a2d-4c3f-8b7a-1d2e3f4a5b6c',
          location: { uuid: mockLocationInpatientWard.uuid, name: mockLocationInpatientWard.name },
          patient: { identifier: '100732HE', name: 'Jane Smith', uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          service: { name: 'HIV Clinic', uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1' },
          startDateTime: dayjs().hour(10).valueOf(),
          status: 'Scheduled',
        },
      ] as Array<Appointment>,
      isLoading: false,
      error: undefined,
    });

    renderCalendar();
    await user.click(screen.getByRole('tab', { name: /daily/i }));

    const locationFilter = screen.getByRole('combobox', { name: /location/i });
    expect(locationFilter).toHaveTextContent('All locations');
    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    await user.click(locationFilter);
    await user.click(screen.getByRole('option', { name: 'Inpatient Ward' }));

    expect(locationFilter).toHaveTextContent('1 location');
    expect(screen.queryByText('John Wilson')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(mockUseAppointmentsCalendar.mock.calls.at(-1)?.[2]).toEqual([mockLocationInpatientWard.uuid]);

    await user.click(screen.getByRole('button', { name: /clear all selected items/i }));

    expect(locationFilter).toHaveTextContent('All locations');
    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(mockUseAppointmentsCalendar.mock.calls.at(-1)?.[2]).toEqual([]);
  });
});
