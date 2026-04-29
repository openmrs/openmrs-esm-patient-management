import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import AppointmentActions from './appointments-actions.component';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import userEvent from '@testing-library/user-event';

jest.mock('../../patient-appointments/patient-appointments.resource');
const mockChangeAppointmentStatus = changeAppointmentStatus as jest.Mock;

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
    location: {
      uuid: '8d6c993e-c2cc-11de-8d13-0010c6dffd0f',
    },
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
  status: null,
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
  appointment: appointment,
  hasActiveVisit: false,
};

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

describe('AppointmentActions', () => {
  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the check in button when appointment is scheduled and check in button is enabled', () => {
    appointment.status = AppointmentStatus.SCHEDULED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    render(<AppointmentActions {...defaultProps} />);

    expect(screen.getByText(/check in/i)).toBeInTheDocument();
  });

  it('does not render the check in button when appointment is scheduled but the check-in button is disabled', () => {
    appointment.status = AppointmentStatus.SCHEDULED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: false, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    render(<AppointmentActions {...defaultProps} />);

    expect(screen.queryByText(/check in/i)).not.toBeInTheDocument();
  });

  it('does not render any action buttons when the appointment is completed', () => {
    appointment.status = AppointmentStatus.COMPLETED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    render(<AppointmentActions {...defaultProps} />);

    expect(screen.queryByText(/check in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/check out/i)).not.toBeInTheDocument();
  });

  it('does not render any action buttons when the appointment is missed', () => {
    appointment.status = AppointmentStatus.MISSED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    render(<AppointmentActions {...defaultProps} />);

    expect(screen.queryByText(/check in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/check out/i)).not.toBeInTheDocument();
  });

  it('renders the check out button when the appointment status is checked in and the check out button is enabled', () => {
    appointment.status = AppointmentStatus.CHECKEDIN;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    render(<AppointmentActions {...defaultProps} />);

    expect(screen.getByText(/check out/i)).toBeInTheDocument();
  });

  it('does not render the check out button when the appointment status is checked in but the check out button is disabled', () => {
    appointment.status = AppointmentStatus.CHECKEDIN;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
      checkOutButton: { enabled: false, customUrl: '' },
    });

    render(<AppointmentActions {...defaultProps} />);

    expect(screen.queryByText(/check out/i)).not.toBeInTheDocument();
  });

  it('calls changeAppointmentStatus when active visit exists and check-in clicked', async () => {
    appointment.status = AppointmentStatus.SCHEDULED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, customUrl: '' },
    });

    mockChangeAppointmentStatus.mockResolvedValue({});
    render(<AppointmentActions {...defaultProps} hasActiveVisit={true} />);

    const btn = screen.getByRole('button', { name: /check in/i });
    await userEvent.click(btn);

    expect(mockChangeAppointmentStatus).toHaveBeenCalledWith('CheckedIn', appointment.uuid);
  });
});
