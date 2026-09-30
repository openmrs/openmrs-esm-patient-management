import React from 'react';
import dayjs from 'dayjs';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useCalendarDistribution, useMonthlyCalendarDistribution } from './workload.resource';
import Workload from './workload.component';

vi.mock('./workload.resource', () => ({
  useCalendarDistribution: vi.fn().mockReturnValue([]),
  useMonthlyCalendarDistribution: vi.fn().mockReturnValue([]),
}));

vi.mock('../hooks/useAppointmentService', () => ({
  useAppointmentServices: vi.fn().mockReturnValue({
    serviceTypes: [{ uuid: 'service-uuid', name: 'Outpatient' }],
    isLoading: false,
    error: null,
  }),
}));

const mockUseCalendarDistribution = vi.mocked(useCalendarDistribution);
const mockUseMonthlyCalendarDistribution = vi.mocked(useMonthlyCalendarDistribution);

describe('Workload', () => {
  it('falls back to the current date when no appointment date is set', () => {
    render(
      <BrowserRouter>
        <Workload selectedService="Outpatient" appointmentDate={undefined} onWorkloadDateChange={vi.fn()} />
      </BrowserRouter>,
    );

    const today = dayjs().format('YYYY-MM-DD');
    const [, , calendarDate] = mockUseCalendarDistribution.mock.calls.at(-1);
    const [, , monthlyDate] = mockUseMonthlyCalendarDistribution.mock.calls.at(-1);

    expect(dayjs(calendarDate).format('YYYY-MM-DD')).toBe(today);
    expect(dayjs(monthlyDate).format('YYYY-MM-DD')).toBe(today);
  });

  it('keeps showing the last defined appointment date when the date becomes undefined', () => {
    const appointmentDate = new Date(2024, 0, 4);

    const { rerender } = render(
      <BrowserRouter>
        <Workload selectedService="Outpatient" appointmentDate={appointmentDate} onWorkloadDateChange={vi.fn()} />
      </BrowserRouter>,
    );

    rerender(
      <BrowserRouter>
        <Workload selectedService="Outpatient" appointmentDate={undefined} onWorkloadDateChange={vi.fn()} />
      </BrowserRouter>,
    );

    const [, , calendarDate] = mockUseCalendarDistribution.mock.calls.at(-1);
    const [, , monthlyDate] = mockUseMonthlyCalendarDistribution.mock.calls.at(-1);

    expect(calendarDate).toBe(appointmentDate);
    expect(monthlyDate).toBe(appointmentDate);
  });
});
