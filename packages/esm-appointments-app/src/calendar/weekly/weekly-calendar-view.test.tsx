import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import WeeklyCalendarView from './weekly-calendar-view.component';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const june09WeekStart = dayjs('2026-06-09').startOf('week');

function isoDay(offset: number): string {
  return june09WeekStart.add(offset, 'day').format('YYYY-MM-DD');
}

function ts(dayOffset: number, hour: number, minute = 0): number {
  return june09WeekStart.add(dayOffset, 'day').hour(hour).minute(minute).valueOf();
}

const mockAppointment = (overrides = {}) => ({
  uuid: 'test-uuid',
  appointmentNumber: '0001',
  appointmentKind: 'Scheduled',
  comments: '',
  endDateTime: null,
  location: { uuid: 'loc-uuid', name: 'Test Clinic' },
  patient: { identifier: 'PAT-001', name: 'Test Patient', uuid: 'pat-uuid' },
  provider: { uuid: 'prov-uuid', display: 'Dr. Test' },
  providers: [],
  recurring: false,
  service: { appointmentServiceId: 1, name: 'Outpatient', uuid: 'svc-uuid', durationMins: 15 },
  startDateTime: ts(0, 9),
  status: 'Scheduled',
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
        uuid: 'a1',
        startDateTime: ts(1, 9, 14),
        patient: { identifier: 'P1', name: 'Agnes Adams', uuid: 'p1' },
      }),
      mockAppointment({
        uuid: 'a2',
        startDateTime: ts(1, 10, 42),
        patient: { identifier: 'P2', name: 'Kevin Brown', uuid: 'p2' },
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
        uuid: 'a1',
        startDateTime: ts(1, 9, 0),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
      }),
      mockAppointment({
        uuid: 'a2',
        startDateTime: ts(1, 10, 0),
        patient: { identifier: 'P2', name: 'Bob', uuid: 'p2' },
      }),
      mockAppointment({
        uuid: 'a3',
        startDateTime: ts(1, 11, 0),
        patient: { identifier: 'P3', name: 'Carol', uuid: 'p3' },
      }),
      mockAppointment({
        uuid: 'a4',
        startDateTime: ts(1, 11, 30),
        patient: { identifier: 'P4', name: 'Dave', uuid: 'p4' },
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
        uuid: 'a1',
        startDateTime: ts(1, 9, 0),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
      }),
      mockAppointment({
        uuid: 'a2',
        startDateTime: ts(1, 10, 0),
        patient: { identifier: 'P2', name: 'Bob', uuid: 'p2' },
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
        uuid: 'a1',
        startDateTime: ts(1, 9, 0),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
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
        uuid: 'a1',
        startDateTime: ts(1, 9, 0),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
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
        uuid: 'a1',
        startDateTime: ts(1, 9, 0),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
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
      mockAppointment({ uuid: 'a1', startDateTime: ts(1, 9, 0) }),
      mockAppointment({ uuid: 'a2', startDateTime: ts(1, 10, 0) }),
      mockAppointment({ uuid: 'a3', startDateTime: ts(1, 11, 0) }),
    ]);

    renderWeekly({ onSelectDate });

    await screen.findByText('+1 more');

    await user.click(screen.getByText('+1 more'));
    expect(onSelectDate).toHaveBeenCalledWith(isoDay(1), 6, 12);
  });

  it('renders empty cells without content for blocks with no appointments', async () => {
    mockAppointmentsForDay(1, [
      mockAppointment({
        uuid: 'a1',
        startDateTime: ts(1, 9, 0),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('Alice');

    expect(screen.getAllByText('Alice').length).toBe(1);
  });

  it('renders without crashing (smoke test)', async () => {
    mockAppointmentsForDay(0, [
      mockAppointment({
        uuid: 'a1',
        startDateTime: ts(0, 9, 0),
        patient: { identifier: 'P1', name: 'Test Patient', uuid: 'p1' },
      }),
    ]);

    renderWeekly();

    await screen.findByText('Test Patient');
  });

  it('supports different calendar keys without crashing', async () => {
    mockAppointmentsForDay(0, [
      mockAppointment({
        uuid: 'a1',
        startDateTime: ts(0, 9, 0),
        patient: { identifier: 'P1', name: 'Test Patient', uuid: 'p1' },
      }),
    ]);

    renderWeekly({ calKey: 'ethiopic' });

    await screen.findByText('Test Patient');
  });
});
