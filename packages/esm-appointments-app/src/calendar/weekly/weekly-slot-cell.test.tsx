import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { type Appointment } from './../../types';
import WeeklySlotCell from './weekly-slot-cell.component';

const baseAppointment: Appointment = {
  uuid: 'appt-uuid',
  appointmentKind: 'Scheduled' as Appointment['appointmentKind'],
  appointmentNumber: '0001',
  comments: '',
  endDateTime: null,
  location: { uuid: 'loc-uuid', name: 'Test Clinic' },
  patient: { identifier: 'PAT-001', name: 'Test Patient', uuid: 'pat-uuid' },
  provider: { uuid: 'prov-uuid', display: 'Dr. Test' },
  providers: [],
  recurring: false,
  service: { appointmentServiceId: 1, name: 'Outpatient', uuid: 'svc-uuid', durationMins: 15 },
  startDateTime: new Date('2026-06-09T09:00:00').getTime(),
  status: 'Scheduled' as Appointment['status'],
  voided: false,
  extensions: {},
  teleconsultationLink: null,
};

function makeAppt(overrides: Partial<Appointment> = {}): Appointment {
  return { ...baseAppointment, uuid: `appt-${Math.random().toString(36).slice(2, 9)}`, ...overrides };
}

function renderCell(props: Partial<React.ComponentProps<typeof WeeklySlotCell>> = {}) {
  return render(
    <WeeklySlotCell
      appointments={props.appointments ?? []}
      isoDate={props.isoDate ?? '2026-06-09'}
      startHour={props.startHour ?? 6}
      endHour={props.endHour ?? 12}
      isToday={props.isToday ?? false}
      onSelectDate={props.onSelectDate ?? vi.fn()}
    />,
  );
}

describe('WeeklySlotCell — empty states', () => {
  it('renders an empty cell when appointments array is empty', () => {
    renderCell({ appointments: [] });
    const cell = screen.getByTestId('slot-cell');
    expect(cell).toHaveClass('slotCell');
    expect(cell).not.toHaveClass('slotCellHasAppts');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
  });

  it('renders empty when no appointments fall in the time block', () => {
    const appt = makeAppt({ startDateTime: new Date('2026-06-09T14:00:00').getTime() });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
  });

  it('adds today class to empty cell when isToday is true', () => {
    renderCell({ isToday: true, appointments: [] });
    expect(screen.getByTestId('slot-cell')).toHaveClass('slotCellToday');
  });

  it('does not add today class when isToday is false', () => {
    renderCell({ isToday: false, appointments: [] });
    expect(screen.getByTestId('slot-cell')).not.toHaveClass('slotCellToday');
  });
});

describe('WeeklySlotCell — preview rendering', () => {
  it('renders time and patient name for a single appointment', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T09:14:00').getTime(),
      patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.getByText('9:14 AM')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders two appointments when exactly 2 fall in the block', () => {
    const appts = [
      makeAppt({
        startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T10:00:00').getTime(),
        patient: { identifier: 'P2', name: 'Bob', uuid: 'p2' },
      }),
    ];
    renderCell({ appointments: appts, startHour: 6, endHour: 12 });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText(/\+.*more/)).not.toBeInTheDocument();
  });

  it('shows only first 2 appointments with +N more for overflow', () => {
    const appts = [
      makeAppt({
        startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T10:00:00').getTime(),
        patient: { identifier: 'P2', name: 'Bob', uuid: 'p2' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T11:00:00').getTime(),
        patient: { identifier: 'P3', name: 'Carol', uuid: 'p3' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T11:30:00').getTime(),
        patient: { identifier: 'P4', name: 'Dave', uuid: 'p4' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T11:45:00').getTime(),
        patient: { identifier: 'P5', name: 'Eve', uuid: 'p5' },
      }),
    ];
    renderCell({ appointments: appts, startHour: 6, endHour: 12 });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('+3 more')).toBeInTheDocument();
    expect(screen.queryByText('Carol')).not.toBeInTheDocument();
    expect(screen.queryByText('Dave')).not.toBeInTheDocument();
    expect(screen.queryByText('Eve')).not.toBeInTheDocument();
  });

  it('renders +1 more when exactly 3 appointments', () => {
    const appts = [
      makeAppt({
        startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        patient: { identifier: 'P1', name: 'A', uuid: 'p1' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T10:00:00').getTime(),
        patient: { identifier: 'P2', name: 'B', uuid: 'p2' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T11:00:00').getTime(),
        patient: { identifier: 'P3', name: 'C', uuid: 'p3' },
      }),
    ];
    renderCell({ appointments: appts, startHour: 6, endHour: 12 });

    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('renders +2 more when exactly 4 appointments', () => {
    const appts = Array.from({ length: 4 }, (_, i) =>
      makeAppt({
        startDateTime: new Date(`2026-06-09T${String(7 + i).padStart(2, '0')}:00:00`).getTime(),
        patient: { identifier: `P${i}`, name: `Patient${i}`, uuid: `p${i}` },
      }),
    );
    renderCell({ appointments: appts, startHour: 6, endHour: 12 });

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('sorts appointments by startDateTime ascending', () => {
    const appts = [
      makeAppt({
        startDateTime: new Date('2026-06-09T11:00:00').getTime(),
        patient: { identifier: 'P3', name: 'Third', uuid: 'p3' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        patient: { identifier: 'P1', name: 'First', uuid: 'p1' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T10:00:00').getTime(),
        patient: { identifier: 'P2', name: 'Second', uuid: 'p2' },
      }),
    ];
    renderCell({ appointments: appts, startHour: 6, endHour: 12 });

    const names = screen.getAllByText(/^(First|Second)$/);
    expect(names.map((el) => el.textContent)).toEqual(['First', 'Second']);
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('renders "—" for appointment with missing patient name', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T09:00:00').getTime(),
      patient: { identifier: 'P1', name: null as unknown as string, uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders PM times correctly', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T14:30:00').getTime(),
      patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 12, endHour: 18 });

    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('renders midnight as 12:00 AM', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T00:30:00').getTime(),
      patient: { identifier: 'P1', name: 'Late', uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 0, endHour: 6 });

    expect(screen.getByText('12:30 AM')).toBeInTheDocument();
  });

  it('renders noon as 12:00 PM', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T12:00:00').getTime(),
      patient: { identifier: 'P1', name: 'Noon', uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 12, endHour: 18 });

    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });
});

describe('WeeklySlotCell — interactions', () => {
  it('calls onSelectDate with correct args when cell is clicked', () => {
    const onSelectDate = vi.fn();
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T09:00:00').getTime(),
      patient: { identifier: 'P1', name: 'Alice', uuid: 'p1' },
    });
    renderCell({
      appointments: [appt],
      isoDate: '2026-06-09',
      startHour: 6,
      endHour: 12,
      onSelectDate,
    });

    fireEvent.click(screen.getByRole('button'));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledWith('2026-06-09', 6, 12);
  });

  it('fires onSelectDate on Enter key', () => {
    const onSelectDate = vi.fn();
    const appt = makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() });
    renderCell({ appointments: [appt], isoDate: '2026-06-09', startHour: 6, endHour: 12, onSelectDate });

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(onSelectDate).toHaveBeenCalledWith('2026-06-09', 6, 12);
  });

  it('fires onSelectDate on Space key', () => {
    const onSelectDate = vi.fn();
    const appt = makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() });
    renderCell({ appointments: [appt], isoDate: '2026-06-09', startHour: 6, endHour: 12, onSelectDate });

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });

    expect(onSelectDate).toHaveBeenCalledWith('2026-06-09', 6, 12);
  });

  it('ignores non-Enter/Space keys', () => {
    const onSelectDate = vi.fn();
    const appt = makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12, onSelectDate });

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });
    fireEvent.keyDown(screen.getByRole('button'), { key: 'ArrowDown' });

    expect(onSelectDate).not.toHaveBeenCalled();
  });

  it('calls onSelectDate when +N more link is clicked', () => {
    const onSelectDate = vi.fn();
    const appts = [
      makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() }),
      makeAppt({ startDateTime: new Date('2026-06-09T10:00:00').getTime() }),
      makeAppt({ startDateTime: new Date('2026-06-09T11:00:00').getTime() }),
    ];
    renderCell({ appointments: appts, isoDate: '2026-06-09', startHour: 6, endHour: 12, onSelectDate });

    fireEvent.click(screen.getByText('+1 more'));

    expect(onSelectDate).toHaveBeenCalledWith('2026-06-09', 6, 12);
  });

  it('+N more click does not trigger parent cell click (stopPropagation)', () => {
    const onSelectDate = vi.fn();
    const appts = [
      makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() }),
      makeAppt({ startDateTime: new Date('2026-06-09T10:00:00').getTime() }),
      makeAppt({ startDateTime: new Date('2026-06-09T11:00:00').getTime() }),
    ];
    renderCell({ appointments: appts, startHour: 6, endHour: 12, onSelectDate });

    fireEvent.click(screen.getByText('+1 more'));

    expect(onSelectDate).toHaveBeenCalledTimes(1);
  });
});

describe('WeeklySlotCell — time-block filtering', () => {
  it('includes appointment at the start hour boundary (inclusive)', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T06:00:00').getTime(),
      patient: { identifier: 'P1', name: 'Edge', uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.getByText('Edge')).toBeInTheDocument();
  });

  it('excludes appointment at the end hour boundary (exclusive)', () => {
    const appt = makeAppt({
      startDateTime: new Date('2026-06-09T12:00:00').getTime(),
      patient: { identifier: 'P1', name: 'Noon', uuid: 'p1' },
    });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Noon')).not.toBeInTheDocument();
  });

  it('excludes appointments with null startDateTime from the block', () => {
    const appt = makeAppt({ startDateTime: null, patient: { identifier: 'P1', name: 'NullTime', uuid: 'p1' } });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('NullTime')).not.toBeInTheDocument();
  });

  it('filters across all 4 time blocks correctly', () => {
    const appts = [
      makeAppt({
        startDateTime: new Date('2026-06-09T03:00:00').getTime(),
        patient: { identifier: 'P0', name: '12-6 AM', uuid: 'p0' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        patient: { identifier: 'P1', name: '6-12 AM', uuid: 'p1' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T15:00:00').getTime(),
        patient: { identifier: 'P2', name: '12-6 PM', uuid: 'p2' },
      }),
      makeAppt({
        startDateTime: new Date('2026-06-09T21:00:00').getTime(),
        patient: { identifier: 'P3', name: '6-12 PM', uuid: 'p3' },
      }),
    ];

    renderCell({ appointments: appts, startHour: 6, endHour: 12 });

    expect(screen.getByText('6-12 AM')).toBeInTheDocument();
    expect(screen.queryByText('12-6 AM')).not.toBeInTheDocument();
    expect(screen.queryByText('12-6 PM')).not.toBeInTheDocument();
    expect(screen.queryByText('6-12 PM')).not.toBeInTheDocument();
  });
});

describe('WeeklySlotCell — accessibility', () => {
  it('has role="button" when appointments exist', () => {
    const appt = makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has tabIndex={0} when appointments exist', () => {
    const appt = makeAppt({ startDateTime: new Date('2026-06-09T09:00:00').getTime() });
    renderCell({ appointments: [appt], startHour: 6, endHour: 12 });

    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('does not have role="button" when empty', () => {
    renderCell({ appointments: [], startHour: 6, endHour: 12 });

    expect(screen.getByTestId('slot-cell').getAttribute('role')).not.toBe('button');
  });
});
