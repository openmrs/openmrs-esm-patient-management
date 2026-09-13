import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import {
  mockLocationInpatientWard,
  mockMappedAppointmentsData,
  mockPatient,
  mockProviders,
  mockUseAppointmentServiceData,
} from '__mocks__';
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

const outpatientService = mockUseAppointmentServiceData[0];
const hivService = mockMappedAppointmentsData.data[0];
const provider = mockProviders.data[0];

const defaultProps = {
  calendarSelectedDate: dayjs('2026-06-09'),
};

const mockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  uuid: '3b4d4f2a-7c8d-4e1f-9a6b-5c8d2e1f4a7b',
  appointmentNumber: 'APT-0001',
  appointmentKind: AppointmentKind.SCHEDULED,
  comments: '',
  endDateTime: new Date('2026-06-09T09:15:00').getTime(),
  location: { uuid: mockLocationInpatientWard.uuid, name: mockLocationInpatientWard.name },
  patient: {
    identifier: mockPatient.identifier,
    name: mockPatient.name,
    uuid: mockPatient.uuid,
  },
  provider: { uuid: provider.uuid, display: provider.display },
  providers: [{ uuid: provider.uuid }],
  recurring: false,
  service: {
    appointmentServiceId: outpatientService.appointmentServiceId,
    creatorName: 'Test Creator',
    description: 'Outpatient service',
    durationMins: 15,
    endTime: '17:00',
    initialAppointmentStatus: 'Scheduled',
    maxAppointmentsLimit: null,
    name: outpatientService.name,
    startTime: '08:00',
    uuid: outpatientService.uuid,
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
          service: {
            ...mockAppointment().service,
            name: hivService.serviceType,
            uuid: hivService.serviceUuid,
          },
          startDateTime: new Date('2026-06-09T14:30:00').getTime(),
        }),
      ],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByText(mockPatient.name);
    await screen.findByText(hivService.serviceType);
    await screen.findByText('2:30 PM');
    await screen.findByText('Scheduled');
  });

  it('renders multiple appointments in the same hour slot', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        mockAppointment({
          patient: { identifier: mockPatient.identifier, name: mockPatient.name, uuid: mockPatient.uuid },
          startDateTime: new Date('2026-06-09T09:00:00').getTime(),
        }),
        mockAppointment({
          patient: { identifier: '100732HE', name: 'Jane Smith', uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          startDateTime: new Date('2026-06-09T09:30:00').getTime(),
        }),
      ],
    } as FetchResponse);
    renderWithSwr(<DailyCalendarView {...defaultProps} />);

    await screen.findByText(mockPatient.name);
    await screen.findByText('Jane Smith');
  });
});
