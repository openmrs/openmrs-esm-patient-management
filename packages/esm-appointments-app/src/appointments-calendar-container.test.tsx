import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { mockMappedAppointmentsData, mockUseAppointmentServiceData } from '__mocks__';
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

describe('AppointmentsCalendarContainer - service filtration', () => {
  it('renders the Service filter dropdown in the header and not provider or location dropdowns', () => {
    renderCalendar();

    expect(screen.getByRole('combobox', { name: /service/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /provider/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /location/i })).not.toBeInTheDocument();
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
      const svcFilter = filters?.selectedServiceUuids;
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
