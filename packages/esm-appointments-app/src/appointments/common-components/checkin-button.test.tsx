import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, launchWorkspace2, navigate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import CheckInButton from './checkin-button.component';

vi.mock('../../patient-appointments/patient-appointments.resource');
vi.mock('../../hooks/useMutateAppointments', () => ({
  useMutateAppointments: () => ({ mutateAppointments: vi.fn() }),
}));

const mockChangeAppointmentStatus = changeAppointmentStatus as Mock;
const mockLaunchWorkspace2 = launchWorkspace2 as Mock;
const mockNavigate = navigate as Mock;
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

const appointment: Appointment = {
  uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
  appointmentNumber: '0000',
  patient: {
    identifier: '100GEJ',
    name: 'John Wilson',
    uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    gender: 'M',
    age: 35,
  },
  service: {
    appointmentServiceId: 1,
    name: 'Outpatient',
    description: null,
    startTime: '',
    endTime: '',
    maxAppointmentsLimit: null,
    durationMins: null,
    location: { uuid: '8d6c993e-c2cc-11de-8d13-0010c6dffd0f' },
    uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
    initialAppointmentStatus: 'Scheduled',
    creatorName: null,
  },
  provider: {
    uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
    person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
  },
  location: { name: 'HIV Clinic', uuid: '2131aff8-2e2a-480a-b7ab-4ac53250262b' },
  startDateTime: new Date().toISOString(),
  appointmentKind: AppointmentKind.WALKIN,
  status: AppointmentStatus.SCHEDULED,
  comments: 'Some comments',
  additionalInfo: null,
  providers: [{ uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' }],
  recurring: false,
  voided: false,
  teleconsultationLink: null,
  extensions: [],
  endDateTime: null,
  dateAppointmentScheduled: null,
};

const defaultProps = {
  patientUuid: appointment.patient.uuid,
  appointment,
  mutateVisits: vi.fn(),
};

describe('CheckInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
    });
    mockChangeAppointmentStatus.mockResolvedValue({});
  });

  it('navigates to the customUrl without changing status when one is configured', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '${openmrsSpaBase}/custom-check-in' },
    });

    render(<CheckInButton {...defaultProps} hasActiveVisit={false} />);
    await userEvent.click(screen.getByRole('button', { name: /check in/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '${openmrsSpaBase}/custom-check-in',
        templateParams: { patientUuid: appointment.patient.uuid, appointmentUuid: appointment.uuid },
      }),
    );
    expect(mockChangeAppointmentStatus).not.toHaveBeenCalled();
    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
  });

  it('checks the patient in directly when an active visit already exists', async () => {
    render(<CheckInButton {...defaultProps} hasActiveVisit={true} />);
    await userEvent.click(screen.getByRole('button', { name: /check in/i }));

    expect(mockChangeAppointmentStatus).toHaveBeenCalledWith('CheckedIn', appointment.uuid);
    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
  });

  it('launches the start visit workspace without checking in when there is no active visit', async () => {
    render(<CheckInButton {...defaultProps} hasActiveVisit={false} />);
    await userEvent.click(screen.getByRole('button', { name: /check in/i }));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'appointments-start-visit-workspace',
      expect.objectContaining({ patientUuid: appointment.patient.uuid, openedFrom: 'appointments-check-in' }),
    );
    // Check-in must not happen until the visit has actually been started.
    expect(mockChangeAppointmentStatus).not.toHaveBeenCalled();
  });

  it('does not change the appointment status if visit creation fails', async () => {
    render(<CheckInButton {...defaultProps} hasActiveVisit={false} />);
    await userEvent.click(screen.getByRole('button', { name: /check in/i }));

    // The visit form only invokes onVisitStarted on a successful creation. A failed creation means
    // it is never called, so the appointment status must remain unchanged.
    expect(mockLaunchWorkspace2).toHaveBeenCalledTimes(1);
    const { onVisitStarted } = mockLaunchWorkspace2.mock.calls[0][1];
    expect(typeof onVisitStarted).toBe('function');

    expect(mockChangeAppointmentStatus).not.toHaveBeenCalled();
  });

  it('automatically checks the patient in once the visit has been started', async () => {
    render(<CheckInButton {...defaultProps} hasActiveVisit={false} />);
    await userEvent.click(screen.getByRole('button', { name: /check in/i }));

    const { onVisitStarted } = mockLaunchWorkspace2.mock.calls[0][1];
    expect(mockChangeAppointmentStatus).not.toHaveBeenCalled();

    // Simulate the visit form invoking onVisitStarted after a successful visit creation.
    onVisitStarted();

    await waitFor(() => {
      expect(mockChangeAppointmentStatus).toHaveBeenCalledWith('CheckedIn', appointment.uuid);
    });
    expect(defaultProps.mutateVisits).toHaveBeenCalled();
  });
});
