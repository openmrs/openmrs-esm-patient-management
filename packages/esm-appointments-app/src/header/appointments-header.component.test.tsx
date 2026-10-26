import React from 'react';
import dayjs from 'dayjs';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from '../calendar/appointments-calendar-view.component';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';

const generalMedicine = {
  appointmentServiceId: 1,
  name: 'General Medicine service',
  uuid: '7ba3aa21-cc56-47ca-bb4d-a60549f666c0',
  color: '#feecae',
};

const hivClinic = {
  appointmentServiceId: 2,
  name: 'HIV Clinic',
  uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1',
  color: '#73a947',
};

vi.mock('../hooks/useAppointmentsCalendar', () => ({
  useAppointmentsCalendar: vi.fn().mockReturnValue({ calendarEvents: [], isLoading: false, error: null }),
}));

vi.mock('../hooks/useAppointmentsByDate', () => ({
  useAppointmentsByDate: vi.fn().mockReturnValue({ appointments: [], isLoading: false }),
}));

vi.mock('../hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn().mockReturnValue({
    serviceTypes: [
      {
        appointmentServiceId: 1,
        name: 'General Medicine service',
        uuid: '7ba3aa21-cc56-47ca-bb4d-a60549f666c0',
        color: '#feecae',
      },
      {
        appointmentServiceId: 2,
        name: 'HIV Clinic',
        uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1',
        color: '#73a947',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

const mockUseAppointmentsCalendar = vi.mocked(useAppointmentsCalendar);

function renderCalendar() {
  render(
    <BrowserRouter>
      <AppointmentsCalendarView />
    </BrowserRouter>,
  );
}

describe('Calendar service filter dropdown', () => {
  it('renders every service name in the open dropdown menu', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('combobox', { name: /service/i }));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(screen.getByText('General Medicine service')).toBeInTheDocument();
    expect(screen.getByText('HIV Clinic')).toBeInTheDocument();
  });

  it('narrows the calendar to only the selected service', async () => {
    mockUseAppointmentsCalendar.mockReturnValue({
      calendarEvents: [
        {
          appointmentDate: dayjs().format('YYYY-MM-DDT00:00:00.000ZZ'),
          services: [
            { serviceName: generalMedicine.name, serviceUuid: generalMedicine.uuid, count: 3 },
            { serviceName: hivClinic.name, serviceUuid: hivClinic.uuid, count: 2 },
          ],
        },
      ],
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    renderCalendar();

    // Before filtering, the legend lists both services.
    const legend = screen.getByTestId('services-legend');
    expect(within(legend).getByText('General Medicine service')).toBeInTheDocument();
    expect(within(legend).getByText('HIV Clinic')).toBeInTheDocument();

    // Select only "HIV Clinic" in the filter.
    await user.click(screen.getByRole('combobox', { name: /service/i }));
    await user.click(screen.getByRole('option', { name: /HIV Clinic/i }));

    // The legend now reflects only the selected service.
    expect(within(legend).queryByText('General Medicine service')).not.toBeInTheDocument();
    expect(within(legend).getByText('HIV Clinic')).toBeInTheDocument();
  });
});
