import React from 'react';
import dayjs from 'dayjs';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from '../calendar/appointments-calendar-view.component';
import { type Appointment } from '../types';
import { useAppointmentsByDate } from '../hooks/useAppointmentsByDate';

const generalMedicine = { name: 'General Medicine service', uuid: '7ba3aa21-cc56-47ca-bb4d-a60549f666c0' };
const hivClinic = { name: 'HIV Clinic', uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1' };

const today = dayjs().format('YYYY-MM-DD');
const nineAm = dayjs().hour(9).minute(0).second(0).valueOf();

function makeAppointment(uuid: string, service: { name: string; uuid: string }, patientName: string): Appointment {
  return {
    uuid,
    service: { name: service.name, uuid: service.uuid },
    patient: { name: patientName },
    status: 'Scheduled',
    startDateTime: nineAm,
  } as unknown as Appointment;
}

const appointments = [
  makeAppointment('gm-1', generalMedicine, 'Alice GM'),
  makeAppointment('gm-2', generalMedicine, 'Bob GM'),
  makeAppointment('gm-3', generalMedicine, 'Carol GM'),
  makeAppointment('hiv-1', hivClinic, 'Dave HIV'),
  makeAppointment('hiv-2', hivClinic, 'Eve HIV'),
];

vi.mock('../hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: vi.fn().mockReturnValue({
    calendarEvents: [
      {
        appointmentDate: dayjs().toISOString(),
        services: [
          { serviceName: 'General Medicine service', serviceUuid: '7ba3aa21-cc56-47ca-bb4d-a60549f666c0', count: 3 },
          { serviceName: 'HIV Clinic', serviceUuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', count: 2 },
        ],
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../hooks/useAppointmentsByDate', () => ({
  useAppointmentsByDate: vi.fn(),
}));

vi.mock('../hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn().mockReturnValue({
    serviceTypes: [
      { appointmentServiceId: 1, name: 'General Medicine service', uuid: '7ba3aa21-cc56-47ca-bb4d-a60549f666c0' },
      { appointmentServiceId: 2, name: 'HIV Clinic', uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1' },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mocked(useAppointmentsByDate).mockReturnValue({ appointments, isLoading: false } as ReturnType<
  typeof useAppointmentsByDate
>);

function renderCalendar() {
  render(
    <BrowserRouter>
      <AppointmentsCalendarView />
    </BrowserRouter>,
  );
}

const todayCell = () => screen.getByTestId(`workload-cell-${today}`);
const serviceArea = (uuid: string) => screen.queryByTestId(`service-area-${uuid}`);

describe('Calendar service filter dropdown', () => {
  it('renders every service name in the open dropdown menu', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('combobox', { name: /service/i }));

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: /General Medicine service/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /HIV Clinic/i })).toBeInTheDocument();
  });

  it('summarizes the selection in the field label', async () => {
    const user = userEvent.setup();
    renderCalendar();

    // Empty state shows the "all" summary.
    expect(screen.getByText('All services')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: /service/i }));
    await user.click(screen.getByRole('option', { name: /HIV Clinic/i }));

    // Summary now reflects the selected count.
    expect(screen.getByText('1 service(s)')).toBeInTheDocument();
    expect(screen.queryByText('All services')).not.toBeInTheDocument();
  });

  it('filters monthly totals and daily cards by the selected service, and restores them when cleared', async () => {
    const user = userEvent.setup();
    renderCalendar();

    // --- Monthly: both services present, total is 3 + 2 = 5 ---
    expect(within(todayCell()).getByText(/^5 appts$/)).toBeInTheDocument();
    expect(serviceArea(generalMedicine.uuid)).toBeInTheDocument();
    expect(serviceArea(hivClinic.uuid)).toBeInTheDocument();

    // --- Select only "HIV Clinic" ---
    await user.click(screen.getByRole('combobox', { name: /service/i }));
    await user.click(screen.getByRole('option', { name: /HIV Clinic/i }));

    // --- Monthly: only HIV remains, total drops to 2 ---
    expect(within(todayCell()).getByText(/^2 appts$/)).toBeInTheDocument();
    expect(serviceArea(generalMedicine.uuid)).not.toBeInTheDocument();
    expect(serviceArea(hivClinic.uuid)).toBeInTheDocument();

    // --- Daily: only the 2 HIV appointments show ---
    await user.click(screen.getByRole('tab', { name: /daily/i }));
    expect(screen.getByText('Dave HIV')).toBeInTheDocument();
    expect(screen.getByText('Eve HIV')).toBeInTheDocument();
    expect(screen.queryByText('Alice GM')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob GM')).not.toBeInTheDocument();
    expect(screen.queryByText('Carol GM')).not.toBeInTheDocument();

    // --- Clear the selection: all 5 appointments return ---
    await user.click(screen.getByRole('combobox', { name: /service/i }));
    await user.click(screen.getByRole('option', { name: /HIV Clinic/i }));

    expect(screen.getByText('Alice GM')).toBeInTheDocument();
    expect(screen.getByText('Bob GM')).toBeInTheDocument();
    expect(screen.getByText('Carol GM')).toBeInTheDocument();
    expect(screen.getByText('Dave HIV')).toBeInTheDocument();
    expect(screen.getByText('Eve HIV')).toBeInTheDocument();
  });
});
