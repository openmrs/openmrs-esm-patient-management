import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
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

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const defaultProps = {
  calKey: 'gregory',
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
  providers: [{ uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66' }],
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

describe('DailyCalendarView', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('shows loading spinner while fetching', () => {
    mockOpenmrsFetch.mockReturnValue(new Promise(() => {}));
    renderWithSwr(<DailyCalendarView {...defaultProps} />);
    expect(screen.getByText(/Loading appointments/i)).toBeInTheDocument();
  });

  it('shows empty state when no appointments', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/No appointments scheduled/i)).toBeInTheDocument();
    });
  });

  it('renders the date heading and appointment count', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [mockAppointment()] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByText(/June 9, 2026/);
    await screen.findByText('1 appointment(s)');
  });

  it('renders date using the given calendar key', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [mockAppointment()] } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} calKey="ethiopic" />);

    await waitFor(() => expect(screen.getByRole('heading').textContent).toBeTruthy());
  });

  it('renders hour labels only for hours with appointments', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        mockAppointment({
          uuid: '3b4d4f2a-7c8d-4e1f-9a6b-5c8d2e1f4a7b',
          startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        }),
        mockAppointment({
          uuid: '5c6e8f1b-9a2d-4c3f-8b7a-1d2e3f4a5b6c',
          startDateTime: new Date('2026-06-09T14:00:00').getTime(),
        }),
      ],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByText('9 AM');
    await screen.findByText('2 PM');
    await waitFor(() => expect(screen.queryByText('10 AM')).not.toBeInTheDocument());
  });

  it('renders appointment card with patient name, service, time, and status', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        mockAppointment({
          service: { ...mockAppointment().service, name: 'HIV Clinic' },
          startDateTime: new Date('2026-06-09T14:30:00').getTime(),
        }),
      ],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByText('John Wilson');
    await screen.findByText('HIV Clinic');
    await screen.findByText('2:30 PM');
    await screen.findByText('Scheduled');
  });

  it('renders multiple appointments in the same hour slot', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        mockAppointment({
          patient: { identifier: '100GEJ', name: 'John Wilson', uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        }),
        mockAppointment({
          patient: { identifier: '100732HE', name: 'Jane Smith', uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          startDateTime: new Date('2026-06-09T09:30:00').getTime(),
        }),
      ],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByText('John Wilson');
    await screen.findByText('Jane Smith');
  });
});
