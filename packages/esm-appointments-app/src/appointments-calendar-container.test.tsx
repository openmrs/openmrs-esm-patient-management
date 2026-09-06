import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  mockLocationInpatientWard,
  mockMappedAppointmentsData,
  mockPatient,
  mockProviders,
  mockUseAppointmentServiceData,
} from '__mocks__';
import AppointmentsCalendarContainer from './appointments-calendar-container.component';
import { useAppointmentsCalendar } from './hooks/useAppointmentsCalendar';
import { useAppointmentServices } from './hooks/useAppointmentService';

vi.mock('./hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: vi.fn().mockReturnValue({ calendarEvents: [], isLoading: false, error: null }),
}));

vi.mock('./hooks/useAppointmentsByDate', () => ({
  useAppointmentsByDate: vi.fn().mockReturnValue({ appointments: [], isLoading: false }),
}));

vi.mock('./hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn().mockReturnValue({ serviceTypes: [], isLoading: false }),
}));

const mockUseAppointmentsCalendar = vi.mocked(useAppointmentsCalendar);
const mockUseAppointmentServices = vi.mocked(useAppointmentServices);

function renderCalendar() {
  return render(
    <BrowserRouter>
      <AppointmentsCalendarContainer />
    </BrowserRouter>,
  );
}

const outpatientService = mockUseAppointmentServiceData[0];
const hivService = mockMappedAppointmentsData.data[0];
const provider = mockProviders.data[0];

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

const outpatient = svc(outpatientService.name, outpatientService.uuid);
const hivClinic = svc(hivService.serviceType, hivService.serviceUuid);

const mockAppointment = (overrides = {}) => ({
  uuid: 'test-uuid',
  appointmentNumber: '0001',
  appointmentKind: 'Scheduled',
  comments: '',
  endDateTime: null,
  location: { uuid: mockLocationInpatientWard.uuid, name: mockLocationInpatientWard.name },
  patient: { identifier: mockPatient.identifier, name: mockPatient.name, uuid: mockPatient.uuid },
  provider: { uuid: provider.uuid, display: provider.display },
  providers: [{ uuid: provider.uuid, display: provider.display }],
  recurring: false,
  service: outpatient,
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

  it('renders the Monthly and Daily view switcher', () => {
    renderCalendar();
    expect(screen.getByRole('tab', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /daily/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /weekly/i })).not.toBeInTheDocument();
  });

  it('switches to daily period when Daily tab is clicked', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('tab', { name: /daily/i }));

    const lastCall = mockUseAppointmentsCalendar.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe('daily');
  });

  it('renders the Today button', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
  });

  it('displays the appointment count for the month', () => {
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
          services: [{ serviceName: outpatient.name, serviceUuid: outpatient.uuid, count: 1 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    expect(screen.getByText('1 appointment this month')).toBeInTheDocument();
  });

  it('displays the singular appointment count in daily mode', async () => {
    const user = userEvent.setup();
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: '2026-07-02',
          services: [{ serviceName: outpatient.name, serviceUuid: outpatient.uuid, count: 1 }],
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

  it('opens popup when a day cell with appointments is clicked, then switches to daily view', async () => {
    const user = userEvent.setup();
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
          services: [{ serviceName: outpatient.name, serviceUuid: outpatient.uuid, count: 1 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    await user.click(screen.getAllByText(outpatient.name)[0]);

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
          services: [{ serviceName: hivClinic.name, serviceUuid: hivClinic.uuid, count: 1 }],
        },
      ],
      isLoading: false,
      error: null,
    });

    renderCalendar();

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getAllByText(hivClinic.name).length).toBeGreaterThanOrEqual(1);
  });

  it('shows the same color for a service in both legend and monthly views', () => {
    const today = dayjs().format('YYYY-MM-DD');
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: today,
          services: [{ serviceName: hivClinic.name, serviceUuid: hivClinic.uuid, count: 3 }],
        },
      ],
      isLoading: false,
      error: null,
    });
    mockUseAppointmentServices.mockReturnValue({
      serviceTypes: [hivClinic],
      isLoading: false,
    });

    renderCalendar();

    const legendSwatch = screen.getByTestId(`legend-swatch-${hivClinic.uuid}`);
    const cellSwatch = screen.getByTestId(`service-swatch-${hivClinic.uuid}`);

    expect(legendSwatch).toBeInTheDocument();
    expect(cellSwatch).toBeInTheDocument();
    expect(legendSwatch.style.backgroundColor).toBeTruthy();
    expect(legendSwatch.style.backgroundColor).toBe(cellSwatch.style.backgroundColor);
  });

  it('renders the Service filter dropdown in the header and not provider or location dropdowns', () => {
    renderCalendar();

    expect(screen.getByRole('combobox', { name: /service/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /provider/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /location/i })).not.toBeInTheDocument();
  });

  it('narrows the monthly grid when a service filter is selected', async () => {
    const user = userEvent.setup();
    const allEvents = [
      {
        appointmentDate: dayjs().date(10).format('YYYY-MM-DD'),
        services: [
          { serviceName: outpatient.name, serviceUuid: outpatient.uuid, count: 1 },
          { serviceName: hivClinic.name, serviceUuid: hivClinic.uuid, count: 1 },
        ],
      },
    ];
    mockUseAppointmentsCalendar.mockImplementation((_, __, filters) => {
      const svcFilter = filters?.serviceUuids;
      if (svcFilter?.length) {
        return {
          calendarEvents: allEvents
            .map((e) => ({
              ...e,
              services: e.services.filter((s) => svcFilter.includes(s.serviceUuid)),
            }))
            .filter((e) => e.services.length > 0),
          isLoading: false,
          error: null,
        };
      }
      return { calendarEvents: allEvents, isLoading: false, error: null };
    });
    mockUseAppointmentServices.mockReturnValue({
      serviceTypes: [outpatient, hivClinic],
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <AppointmentsCalendarContainer />
      </BrowserRouter>,
    );

    expect(screen.getAllByText(outpatient.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(hivClinic.name).length).toBeGreaterThanOrEqual(1);

    const serviceFilter = screen.getByRole('combobox', { name: /service/i });
    await user.click(serviceFilter);
    await user.click(await screen.findByRole('option', { name: new RegExp(outpatient.name, 'i') }));
    await user.keyboard('{Escape}');

    expect(screen.getAllByText(outpatient.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(hivClinic.name)).not.toBeInTheDocument();
  });
});
