import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { type FetchResponse, openmrsFetch, launchWorkspace2 } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { type Appointment, AppointmentStatus, AppointmentKind } from '../../types';
import DailyCalendarView from './daily-calendar-view.component';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, opts?: { count?: number }) => {
      if (opts?.count !== undefined) return `${opts.count} appointment(s)`;
      return fallback ?? key;
    },
  }),
}));

vi.mock('../../appointments/common-components/appointments-table.component', () => ({
  __esModule: true,
  default: ({ appointments, tableHeading }: { appointments: Array<Appointment>; tableHeading: string }) => (
    <div data-testid="mock-appointments-table">
      <span>{tableHeading}</span>
      <span>{appointments.length} rows</span>
    </div>
  ),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

const defaultProps = {
  calendarSelectedDate: dayjs('2026-06-09'),
};

const mockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  uuid: '3b4d4f2a-7c8d-4e1f-9a6b-5c8d2e1f4a7b',
  appointmentNumber: 'APT-0001',
  appointmentKind: AppointmentKind.SCHEDULED,
  comments: '',
  endDateTime: new Date('2026-06-09T09:15:00').getTime(),
  location: { uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574', name: 'Inpatient Ward' },
  patient: {
    identifier: '100GEJ',
    name: 'John Wilson',
    uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
  },
  provider: { uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66', display: 'doctor - James Cook' },
  providers: [{ uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66', display: 'doctor - James Cook' }],
  recurring: false,
  service: {
    appointmentServiceId: 1,
    creatorName: 'Test Creator',
    description: 'Outpatient service',
    durationMins: 15,
    endTime: '17:00',
    initialAppointmentStatus: 'Scheduled',
    maxAppointmentsLimit: null,
    name: 'Outpatient',
    startTime: '08:00',
    uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
  },
  startDateTime: new Date('2026-06-09T09:00:00').getTime(),
  dateAppointmentScheduled: new Date('2026-06-09T00:00:00.000Z').getTime(),
  status: AppointmentStatus.SCHEDULED,
  voided: false,
  extensions: {},
  teleconsultationLink: null,
  ...overrides,
});

const appointmentAt = (time: string, uuid: string, durationMins = 15) =>
  mockAppointment({
    uuid,
    startDateTime: new Date(`2026-06-09T${time}:00`).getTime(),
    endDateTime: new Date(`2026-06-09T${time}:00`).getTime() + durationMins * 60000,
  });

describe('DailyCalendarView', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
    mockLaunchWorkspace2.mockReset();
  });

  it('shows loading spinner while fetching', () => {
    mockOpenmrsFetch.mockReturnValue(new Promise(() => {}));
    renderWithSwr(<DailyCalendarView {...defaultProps} />);
    expect(screen.getByText(/Loading appointments/i)).toBeInTheDocument();
  });

  it('shows empty state and clinic-hour rows when no appointments', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    // empty state banner is displayed
    await waitFor(() => {
      expect(screen.getByTestId('daily-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No appointments scheduled for this date')).toBeInTheDocument();
    });
    // the three collapsed/header bars show a "0 appointment(s)" count pill
    expect(screen.getAllByText('0 appointment(s)')).toHaveLength(3);
    // clinic hours 8 AM – 5 PM render as empty live slots
    expect(screen.getAllByTestId(/^hour-row-/)).toHaveLength(9);
    // hours outside clinic hours collapse into bars labeled with their range
    expect(screen.getByRole('button', { name: /12 AM – 8 AM/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5 PM – 12 AM/ })).toBeInTheDocument();
  });

  it('reports the appointment count to the parent', async () => {
    const onAppointmentCountChange = vi.fn();
    mockOpenmrsFetch.mockResolvedValue({ data: [mockAppointment()] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} onAppointmentCountChange={onAppointmentCountChange} />);

    await waitFor(() => {
      expect(onAppointmentCountChange).toHaveBeenCalledWith(1);
    });
  });

  it('resets appointment count to null on date change before loaded', async () => {
    const onAppointmentCountChange = vi.fn();
    mockOpenmrsFetch.mockResolvedValue({ data: [mockAppointment()] } as FetchResponse);
    const { rerender } = renderWithSwr(
      <DailyCalendarView {...defaultProps} onAppointmentCountChange={onAppointmentCountChange} />,
    );

    await waitFor(() => {
      expect(onAppointmentCountChange).toHaveBeenCalledWith(1);
    });

    rerender(
      <DailyCalendarView
        calendarSelectedDate={dayjs('2026-06-10')}
        onAppointmentCountChange={onAppointmentCountChange}
      />,
    );
    expect(onAppointmentCountChange).toHaveBeenCalledWith(null);
  });

  it('positions overlapping blocks into side-by-side lanes', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        appointmentAt('09:00', 'a', 30),
        {
          ...appointmentAt('09:15', 'b', 30),
          patient: { identifier: '100732HE', name: 'Jane Smith', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
        },
      ],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    const first = await screen.findByRole('button', { name: /John Wilson/ });
    expect(first).toHaveStyle({ left: '0%', width: '50%', top: '0px' });

    const second = await screen.findByRole('button', { name: /Jane Smith/ });
    expect(second).toHaveStyle({ left: '50%', width: '50%', top: '32px' });
  });

  it('renders block with patient, time range, provider, and status', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [appointmentAt('09:00', 'a')] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    const block = await screen.findByRole('button', { name: /John Wilson/ });
    expect(block).toHaveTextContent('9:00 AM – 9:15 AM');
    expect(block.title).toContain('doctor - James Cook');
    expect(block.title).toContain('Scheduled');
  });

  it('expands and collapses an off-hours range', async () => {
    const user = userEvent.setup();
    mockOpenmrsFetch.mockResolvedValue({
      data: [appointmentAt('09:00', 'a'), appointmentAt('14:00', 'b')],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    // earlier and later bars exist — click the earlier 12 AM – 8 AM range
    const bar = await screen.findByRole('button', { name: /12 AM – 8 AM/ });
    await user.click(bar);

    // per-hour rows appear below it
    await waitFor(() => {
      expect(screen.getAllByTestId(/^hour-row-0$/)).toHaveLength(1);
    });
    expect(screen.getAllByTestId(/^hour-row-7$/)).toHaveLength(1);
    expect(screen.getByRole('button', { name: /12 AM – 8 AM/ })).toBeInTheDocument();

    // clicking the bar again collapses back to just the bar
    await user.click(screen.getByRole('button', { name: /12 AM – 8 AM/ }));
    await waitFor(() => {
      expect(screen.queryByTestId(/^hour-row-0$/)).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId(/^hour-row-7$/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /12 AM – 8 AM/ })).toBeInTheDocument();
  });

  it('shows a summary block when an hour exceeds the legibility ceiling', async () => {
    const appts = ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:28'].map((t, i) =>
      appointmentAt(t, `uuid-${i}`, 30),
    );
    mockOpenmrsFetch.mockResolvedValue({ data: appts } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByTestId('summary-block');
    expect(screen.getByText(/over the legible limit/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /John Wilson/ })).not.toBeInTheDocument();
  });

  it('opens the appointments table for an overloaded hour and goes back', async () => {
    const user = userEvent.setup();
    const appts = ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:28'].map((t, i) =>
      appointmentAt(t, `uuid-${i}`, 30),
    );
    mockOpenmrsFetch.mockResolvedValue({ data: appts } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByTestId('summary-block');
    await user.click(screen.getByRole('button', { name: /Open in table/i }));

    // heading sits on the toolbar line next to Back
    expect(screen.getByText('7 appointment(s)')).toBeInTheDocument();
    const table = screen.getByTestId('mock-appointments-table');
    expect(table).toHaveTextContent('7 rows');

    await user.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByTestId('summary-block')).toBeInTheDocument();
  });

  it('launches the edit workspace when a block is clicked', async () => {
    const user = userEvent.setup();
    const appointment = appointmentAt('09:00', 'a');
    mockOpenmrsFetch.mockResolvedValue({ data: [appointment] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    const block = await screen.findByRole('button', { name: /John Wilson/ });
    await user.click(block);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('appointments-form-workspace', {
      patientUuid: appointment.patient.uuid,
      appointment,
    });
  });

  it('does not throw when clicking a block with null patient or missing patient uuid', async () => {
    const user = userEvent.setup();
    const appointment = {
      ...appointmentAt('09:00', 'a'),
      patient: null,
    };
    mockOpenmrsFetch.mockResolvedValue({ data: [appointment] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    const block = await screen.findByRole('button', { name: /9:00 AM – 9:15 AM/ });
    await user.click(block);

    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
  });

  it('includes spill-in appointments in overloaded table drilldown', async () => {
    const user = userEvent.setup();
    const spillIn = appointmentAt('08:55', 'spill-in', 30);
    const hour9Appts = ['09:00', '09:05', '09:10', '09:15', '09:20', '09:22'].map((t, i) =>
      appointmentAt(t, `uuid-${i}`, 30),
    );
    mockOpenmrsFetch.mockResolvedValue({ data: [spillIn, ...hour9Appts] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByTestId('summary-block');
    await user.click(screen.getByRole('button', { name: /Open in table/i }));

    const table = screen.getByTestId('mock-appointments-table');
    expect(table).toHaveTextContent('7 rows');
  });

  it('renders error notification when fetching fails', async () => {
    mockOpenmrsFetch.mockRejectedValue(new Error('Network error'));
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading appointments/i)).toBeInTheDocument();
    });
  });

  it('uses service duration when endDateTime is missing', async () => {
    const appointment = mockAppointment({
      endDateTime: null,
      service: { ...mockAppointment().service, durationMins: 60 },
    });
    mockOpenmrsFetch.mockResolvedValue({ data: [appointment] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    const block = await screen.findByRole('button', { name: /John Wilson/ });
    expect(block).toHaveStyle({ height: '126px' });
  });

  it('collapses and re-expands a live appointment range', async () => {
    const user = userEvent.setup();
    mockOpenmrsFetch.mockResolvedValue({ data: [appointmentAt('09:00', 'a')] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    // initially, the 9 AM appointment block is visible in its hour row
    const block = await screen.findByRole('button', { name: /John Wilson/ });
    expect(block).toBeInTheDocument();

    // click the live range bar to collapse it
    const liveBar = screen.getByRole('button', { name: /8 AM – 5 PM/ });
    await user.click(liveBar);

    // appointment block is hidden in collapsed state
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /John Wilson/ })).not.toBeInTheDocument();
    });

    // click again to expand back
    await user.click(screen.getByRole('button', { name: /8 AM – 5 PM/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /John Wilson/ })).toBeInTheDocument();
    });
  });
});
