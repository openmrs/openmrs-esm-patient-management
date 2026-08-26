import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs, { type Dayjs } from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar-view.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { useMonthlyAppointments } from '../hooks/useMonthlyAppointments';
import { useProviders } from '../hooks/useProviders';

vi.mock('../hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: vi.fn().mockReturnValue({ calendarEvents: [], isLoading: false, error: null }),
}));

vi.mock('../hooks/useAppointmentsByDate', () => ({
  useAppointmentsByDate: vi.fn().mockReturnValue({ appointments: [], isLoading: false }),
}));

vi.mock('../hooks/useMonthlyAppointments', () => ({
  useMonthlyAppointments: vi.fn().mockReturnValue({ appointments: [], isLoading: false, error: undefined }),
}));

vi.mock('../hooks/useProviders', () => ({
  useProviders: vi.fn().mockReturnValue({ providers: [], isLoading: false }),
}));

vi.mock('../hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn().mockReturnValue({ serviceTypes: [], isLoading: false }),
}));

const mockUseAppointmentsCalendar = vi.mocked(useAppointmentsCalendar);
const mockUseMonthlyAppointments = vi.mocked(useMonthlyAppointments);
const mockUseProviders = vi.mocked(useProviders);
const mockUseAppointmentServices = vi.mocked(useAppointmentServices);

function renderCalendar() {
  return render(
    <BrowserRouter>
      <AppointmentsCalendarView />
    </BrowserRouter>,
  );
}

function latestRequestedDate(): Dayjs {
  const lastCall = mockUseMonthlyAppointments.mock.calls.at(-1);
  return dayjs(lastCall?.[0] as Dayjs);
}

const svc = (name: string, uuid: string) => ({
  appointmentServiceId: 1,
  creatorName: '',
  description: '',
  endTime: '17:00',
  initialAppointmentStatus: 'Scheduled',
  maxAppointmentsLimit: null,
  name,
  startTime: '08:00',
  uuid,
});

const mockAppointment = (overrides = {}) => ({
  uuid: 'test-uuid',
  appointmentNumber: '0001',
  appointmentKind: 'Scheduled',
  comments: '',
  endDateTime: null,
  location: { uuid: 'loc-uuid', name: 'Test Clinic' },
  patient: { identifier: 'PAT-001', name: 'Test Patient', uuid: 'pat-uuid' },
  provider: { uuid: 'prov-uuid', display: 'Dr. Test' },
  providers: [{ uuid: 'prov-uuid', display: 'Dr. Test' }],
  recurring: false,
  service: svc('Outpatient', 'svc-uuid'),
  startDateTime: dayjs().date(10).hour(9).minute(0).valueOf(),
  status: 'Scheduled',
  voided: false,
  extensions: {},
  teleconsultationLink: null,
  ...overrides,
});

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
    expect(mockUseMonthlyAppointments.mock.calls.at(-1)?.[0]).toBeTruthy();
    expect(mockUseAppointmentsCalendar.mock.calls.at(-1)?.[0]).not.toBeNull();
    expect(typeof mockUseAppointmentsCalendar.mock.calls.at(-1)?.[0]).toBe('string');
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

  it('renders the Today button', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
  });

  it('resets the calendar to today when Today is clicked in monthly mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(latestRequestedDate().isSame(dayjs(), 'month')).toBe(false);

    await user.click(screen.getByRole('button', { name: /today/i }));

    expect(latestRequestedDate().isSame(dayjs(), 'day')).toBe(true);
  });

  it('resets the calendar to today when Today is clicked in daily mode', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(screen.getByRole('button', { name: /today/i }));

    expect(latestRequestedDate().isSame(dayjs(), 'day')).toBe(true);
  });

  it('displays the appointment count for the month', () => {
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
          services: [{ serviceName: 'Outpatient', serviceUuid: 'svc-uuid', count: 1 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    expect(screen.getByText('1 appointments this month')).toBeInTheDocument();
  });

  it('displays the singular appointment count for a single appointment in daily mode', async () => {
    const user = userEvent.setup();
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: '2026-07-02',
          services: [{ serviceName: 'Outpatient', serviceUuid: 'svc-uuid', count: 1 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();
    await user.click(screen.getByRole('tab', { name: /daily/i }));

    expect(screen.getByText('1 appointment')).toBeInTheDocument();
  });

  it('displays month and year title in monthly mode', () => {
    renderCalendar();
    expect(screen.getByText(/^[A-Z][a-z]+ \d{4}$/)).toBeInTheDocument();
  });

  it('opens popup when a day cell with appointments is clicked in monthly mode, then switches to daily view when Open day view is clicked', async () => {
    const user = userEvent.setup();
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
          services: [{ serviceName: 'Outpatient', serviceUuid: 'svc-uuid', count: 1 }],
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
          appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
          services: [{ serviceName: 'Cardiology', serviceUuid: 'cardio-1', count: 1 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getAllByText('Cardiology').length).toBeGreaterThanOrEqual(1);
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
    mockUseAppointmentServices.mockReturnValue({
      serviceTypes: [svc('HIV Clinic', '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1')],
      isLoading: false,
    });

    renderCalendar();

    const legendSwatch = screen.getByTestId('legend-swatch-53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1');
    const cellSwatch = screen.getByTestId('service-swatch-53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1');

    expect(legendSwatch).toBeInTheDocument();
    expect(cellSwatch).toBeInTheDocument();
    expect(legendSwatch.style.backgroundColor).toBeTruthy();
    expect(legendSwatch.style.backgroundColor).toBe(cellSwatch.style.backgroundColor);
  });

  it('renders the Service, Provider and Location filter dropdowns in the header', () => {
    renderCalendar();

    expect(screen.getByRole('combobox', { name: /service/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /provider/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /location/i })).toBeInTheDocument();
  });

  it('narrows the monthly grid when a service filter is selected', async () => {
    const user = userEvent.setup();
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
          services: [
            { serviceName: 'Outpatient', serviceUuid: 'svc-opd', count: 1 },
            { serviceName: 'Lab', serviceUuid: 'svc-lab', count: 1 },
          ],
        },
      ],
      isLoading: false,
      error: null,
    });
    mockUseMonthlyAppointments.mockReturnValue({
      appointments: [
        mockAppointment({ uuid: 'a1', service: svc('Outpatient', 'svc-opd') }),
        mockAppointment({ uuid: 'a2', service: svc('Lab', 'svc-lab') }),
      ],
      isLoading: false,
      error: undefined,
    });
    mockUseAppointmentServices.mockReturnValue({
      serviceTypes: [svc('Outpatient', 'svc-opd'), svc('Lab', 'svc-lab')],
      isLoading: false,
    });

    renderCalendar();

    expect(screen.getAllByText('Outpatient').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Lab').length).toBeGreaterThanOrEqual(1);

    const serviceFilter = screen.getByRole('combobox', { name: /service/i });
    await user.click(serviceFilter);
    await user.click(await screen.findByRole('option', { name: /outpatient/i }));
    await user.keyboard('{Escape}');

    expect(screen.getAllByText('Outpatient').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Lab')).not.toBeInTheDocument();
  });

  it('lists providers in the provider filter dropdown', async () => {
    const user = userEvent.setup();
    mockUseProviders.mockReturnValue({
      providers: [{ uuid: 'prov-1', display: 'Dr. Ada Nwosu', person: { uuid: 'person-1' } }],
      isLoading: false,
    });

    renderCalendar();

    const providerFilter = screen.getByRole('combobox', { name: /provider/i });
    await user.click(providerFilter);
    expect(await screen.findByRole('option', { name: /dr\. ada nwosu/i })).toBeInTheDocument();
  });
});
