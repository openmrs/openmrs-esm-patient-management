import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useAppointmentServices } from '../../hooks/useAppointmentService';
import { type AppointmentService } from '../../types';
import CalendarServiceFilter from './calendar-service-filter.component';

vi.mock('../../hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn(),
}));

const mockUseAppointmentServices = vi.mocked(useAppointmentServices);

const hivClinic = { uuid: 'service-hiv', name: 'HIV Clinic' } as AppointmentService;
const outpatient = { uuid: 'service-outpatient', name: 'Outpatient' } as AppointmentService;

describe('CalendarServiceFilter', () => {
  beforeEach(() => {
    mockUseAppointmentServices.mockReturnValue({
      serviceTypes: [hivClinic, outpatient],
      isLoading: false,
      error: undefined,
    });
  });

  it('shows "All services" when nothing is selected', () => {
    render(<CalendarServiceFilter selectedServiceUuids={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /^service$/i })).toBeInTheDocument();
    expect(screen.getByText('All services')).toBeInTheDocument();
  });

  it('lists every service by name when opened', async () => {
    const user = userEvent.setup();
    render(<CalendarServiceFilter selectedServiceUuids={[]} onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox', { name: /^service$/i }));

    expect(screen.getByRole('option', { name: /HIV Clinic/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Outpatient/i })).toBeInTheDocument();
  });

  it('shows the number of selected services in the trigger label', () => {
    render(<CalendarServiceFilter selectedServiceUuids={[hivClinic.uuid, outpatient.uuid]} onChange={vi.fn()} />);

    expect(screen.getByText('2 service(s)')).toBeInTheDocument();
    expect(screen.queryByText('All services')).not.toBeInTheDocument();
  });
});
