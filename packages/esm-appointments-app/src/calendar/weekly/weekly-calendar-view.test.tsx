import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentKind, AppointmentStatus } from './../../types';
import WeeklyCalendarView from './weekly-calendar-view.component';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const june09WeekStart = dayjs('2026-06-09').startOf('week');

function isoDay(offset: number): string {
  return june09WeekStart.add(offset, 'day').format('YYYY-MM-DD');
}

function ts(dayOffset: number, hour: number, minute = 0): number {
  return june09WeekStart.add(dayOffset, 'day').hour(hour).minute(minute).valueOf();
}

let apptCounter = 0;
function nextApptUuid(): string {
  apptCounter += 1;
  const hex = apptCounter.toString(16).padStart(4, '0');
  return `7cd38a6d-377e-491b-8284-b04cf8b8${hex}`;
}

const mockAppointment = (overrides = {}) => ({
  uuid: nextApptUuid(),
  appointmentNumber: '0000',
  appointmentKind: AppointmentKind.SCHEDULED,
  comments: '',
  dateAppointmentScheduled: null,
  endDateTime: null,
  location: { uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574', name: 'Inpatient Ward' },
  patient: { identifier: '100GEJ', name: 'John Wilson', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  provider: { uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66', display: 'Dr James Cook' },
  providers: [{ uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66', display: 'Dr James Cook' }],
  recurring: false,
  service: {
    appointmentServiceId: 1,
    name: 'Outpatient',
    uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
    description: 'Outpatient service',
    creatorName: null,
    startTime: '08:00',
    endTime: '17:00',
    maxAppointmentsLimit: null,
    initialAppointmentStatus: AppointmentStatus.SCHEDULED,
    durationMins: 15,
  },
  startDateTime: ts(0, 9),
  status: AppointmentStatus.SCHEDULED,
  voided: false,
  extensions: {},
  teleconsultationLink: null,
  ...overrides,
});

function mockAppointmentsForDay(dayOffset: number, appointments: ReturnType<typeof mockAppointment>[]) {
  mockOpenmrsFetch.mockImplementation(async (url: string) => {
    const match = (url as string).match(/forDate=(\d{4}-\d{2}-\d{2})/);
    if (!match) return { data: [] } as FetchResponse;
    const requestedDate = match[1];
    if (requestedDate === isoDay(dayOffset)) {
      return { data: appointments } as FetchResponse;
    }
    return { data: [] } as FetchResponse;
  });
}

function renderWeekly(props = {}) {
  return render(
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map(),
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}>
      <WeeklyCalendarView
        calKey="gregory"
        calendarSelectedDate={dayjs('2026-06-09')}
        onSelectDate={vi.fn()}
        {...props}
      />
    </SWRConfig>,
  );
}

describe('WeeklyCalendarView', () => {
  beforeEach(() => {
    apptCounter = 0;
    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
  });

  it('renders the 7 day column headers', async () => {
    renderWeekly();
    await screen.findByText('Sun');
    await screen.findByText('Mon');
    await screen.findByText('Tue');
    await screen.findByText('Wed');
    await screen.findByText('Thu');
    await screen.findByText('Fri');
    await screen.findByText('Sat');
  });

  it('renders all 4 time-block labels regardless of appointments', async () => {
    renderWeekly();
    await screen.findByText('12 AM – 6 AM');
    await screen.findByText('6 AM – 12 PM');
    await screen.findByText('12 PM – 6 PM');
    await screen.findByText('6 PM – 12 AM');
  });

  it('renders appointment previews with time and patient name', async () => {
    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 14),
        patient: { identifier: '100GEJ', name: 'Agnes Adams', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
      mockAppointment({
        startDateTime: ts(1, 10, 42),
        patient: { identifier: '100GEK', name: 'Kevin Brown', uuid: '5a1c0ab4-9b22-4c6f-84e5-b3e2c3fa5d69' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('9:14 AM');
    await screen.findByText('Agnes Adams');
    await screen.findByText('10:42 AM');
    await screen.findByText('Kevin Brown');
  });

  it('shows +N more link when more than 2 appointments in a block', async () => {
    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 0),
        patient: { identifier: '100GEJ', name: 'Alice', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
      mockAppointment({
        startDateTime: ts(1, 10, 0),
        patient: { identifier: '100GEK', name: 'Bob', uuid: '5a1c0ab4-9b22-4c6f-84e5-b3e2c3fa5d69' },
      }),
      mockAppointment({
        startDateTime: ts(1, 11, 0),
        patient: { identifier: '100GEL', name: 'Carol', uuid: 'c73b920a-4f12-4d8e-91c5-6e7d8f3a2b01' },
      }),
      mockAppointment({
        startDateTime: ts(1, 11, 30),
        patient: { identifier: '100GEM', name: 'Dave', uuid: 'd94e031b-5023-5e9f-a2d6-7f8e9a4b3c12' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('Alice');
    await screen.findByText('Bob');

    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('Carol')).not.toBeInTheDocument();
    expect(screen.queryByText('Dave')).not.toBeInTheDocument();
  });

  it('does not show +N more link when exactly 2 or fewer appointments', async () => {
    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 0),
        patient: { identifier: '100GEJ', name: 'Alice', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
      mockAppointment({
        startDateTime: ts(1, 10, 0),
        patient: { identifier: '100GEK', name: 'Bob', uuid: '5a1c0ab4-9b22-4c6f-84e5-b3e2c3fa5d69' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('Alice');
    await screen.findByText('Bob');

    expect(screen.queryByText(/\+.*more/)).not.toBeInTheDocument();
  });

  it('calls onSelectDate with correct args when a cell is clicked', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();

    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 0),
        patient: { identifier: '100GEJ', name: 'Alice', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
    ]);

    renderWeekly({ onSelectDate });

    await screen.findByText('Alice');

    await user.click(screen.getByRole('button'));
    expect(onSelectDate).toHaveBeenCalledWith(isoDay(1), 6, 12);
  });

  it('handles Enter key on a cell with appointments', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();

    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 0),
        patient: { identifier: '100GEJ', name: 'Alice', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
    ]);

    renderWeekly({ onSelectDate });

    await screen.findByText('Alice');

    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onSelectDate).toHaveBeenCalledWith(isoDay(1), 6, 12);
  });

  it('handles Space key on a cell with appointments', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();

    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 0),
        patient: { identifier: '100GEJ', name: 'Alice', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
    ]);

    renderWeekly({ onSelectDate });

    await screen.findByText('Alice');

    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(onSelectDate).toHaveBeenCalledWith(isoDay(1), 6, 12);
  });

  it('calls onSelectDate when +N more link is clicked', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();

    mockAppointmentsForDay(1, [
      mockAppointment({ startDateTime: ts(1, 9, 0) }),
      mockAppointment({ startDateTime: ts(1, 10, 0) }),
      mockAppointment({ startDateTime: ts(1, 11, 0) }),
    ]);

    renderWeekly({ onSelectDate });

    await screen.findByText('+1 more');

    await user.click(screen.getByText('+1 more'));
    expect(onSelectDate).toHaveBeenCalledWith(isoDay(1), 6, 12);
  });

  it('renders empty cells without content for blocks with no appointments', async () => {
    mockAppointmentsForDay(1, [
      mockAppointment({
        startDateTime: ts(1, 9, 0),
        patient: { identifier: '100GEJ', name: 'Alice', uuid: '3d13f51a-1eaf-4b62-b329-4c21cf95b9a7' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('Alice');

    expect(screen.getAllByText('Alice').length).toBe(1);
  });

  it('renders without crashing (smoke test)', async () => {
    mockAppointmentsForDay(0, [
      mockAppointment({
        startDateTime: ts(0, 9, 0),
        patient: { identifier: '100GEJ', name: 'John Wilson', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('John Wilson');
  });

  it('supports different calendar keys without crashing', async () => {
    mockAppointmentsForDay(0, [
      mockAppointment({
        startDateTime: ts(0, 9, 0),
        patient: { identifier: '100GEJ', name: 'John Wilson', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
      }),
    ]);

    renderWeekly({ calKey: 'ethiopic' });

    await screen.findByText('John Wilson');
  });
});
