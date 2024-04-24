import { render } from '@testing-library/react';
import React from 'react';
import AppointmentActions from './appointments-actions.component';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import { useConfig } from '@openmrs/esm-framework';

let appointment: Appointment = {
  endDateTime: undefined,
  uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
  appointmentNumber: '0000',
  patient: {
    identifier: '100GEJ',
    identifiers: [],
    name: 'John Wilson',
    uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    gender: 'M',
    age: '35',
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
};

/*jest.mock('../../hooks/useTodaysVisits', () => {
  const originalModule = jest.requireActual('../../hooks/useTodaysVisits');

  return {
    ...originalModule,
    useTodaysVisits: jest.fn(),
  };
});*/

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useConfig: jest.fn(),
  };
});

describe('AppointmentActions', () => {
  const defaultProps = {
    visits: [],
    appointment: appointment,
    scheduleType: 'Pending',
    mutate: () => {},
  };

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the check in button when appointment is today and appointment status is scheduled and check in button enabled', () => {
    appointment.status = AppointmentStatus.SCHEDULED;
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    const props = { ...defaultProps };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText(/check in/i);
    expect(button).toBeInTheDocument();
  });

  it('does not renders the check in button when appointment is today and and appointment status is scheduled an in but the check-in button is disabled', () => {
    appointment.status = AppointmentStatus.SCHEDULED;
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: false },
      checkOutButton: { enabled: true },
    }));
    const props = { ...defaultProps };
    const { queryByText } = render(<AppointmentActions {...props} />);
    const button = queryByText('Check In');
    expect(button).not.toBeInTheDocument();
  });

  it('renders the checked out status when appointment is completed', () => {
    appointment.status = AppointmentStatus.COMPLETED;
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    const props = { ...defaultProps };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Checked out');
    expect(button).toBeInTheDocument();
  });

  it('renders the check out button when the patient is checked in it and today is the appointment date and the check out button enabled', () => {
    appointment.status = AppointmentStatus.CHECKEDIN;
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    const props = { ...defaultProps, scheduleType: 'Scheduled' };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Check out');
    expect(button).toBeInTheDocument();
  });

  it('does not render check out button when the patient id checed in and today is the appointment date but the check out button is disabled', () => {
    appointment.status = AppointmentStatus.CHECKEDIN;
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: false },
    }));
    const props = { ...defaultProps, scheduleType: 'Scheduled' };
    const { queryByText } = render(<AppointmentActions {...props} />);
    const button = queryByText('Check out');
    expect(button).not.toBeInTheDocument();
  });
});
