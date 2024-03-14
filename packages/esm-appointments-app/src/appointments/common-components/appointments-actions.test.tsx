import { render, screen } from '@testing-library/react';
import React from 'react';
import AppointmentActions from './appointments-actions.component';
import { useTodaysVisits } from '../../hooks/useTodaysVisits';
import { type Appointment } from '../../types';
import { useConfig } from '@openmrs/esm-framework';

const appointment: Appointment = {
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
  appointmentKind: 'WalkIn',
  status: 'Scheduled',
  comments: 'Some comments',
  additionalInfo: null,
  providers: [{ uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' }],
  recurring: false,
  voided: false,
  teleconsultationLink: null,
  extensions: [],
};

jest.mock('../../hooks/useTodaysVisits', () => {
  const originalModule = jest.requireActual('../../hooks/useTodaysVisits');

  return {
    ...originalModule,
    useTodaysVisits: jest.fn(),
  };
});

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

  it('renders the check in button when appointment is today and the patient has not checked in and check in button enabled', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [],
    }));
    const props = { ...defaultProps };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Check In');
    expect(button).toBeInTheDocument();
  });

  it('does not renders the check in button when appointment is today and the patient has not checked in but the check-in button is disabled', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: false },
      checkOutButton: { enabled: true },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [],
    }));
    const props = { ...defaultProps };
    const { queryByText } = render(<AppointmentActions {...props} />);
    const button = queryByText('Check In');
    expect(button).not.toBeInTheDocument();
  });

  it('renders the checked out button when the patient has checked out', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [
        {
          patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDatetime: new Date().toISOString(),
          stopDatetime: new Date().toISOString(),
        },
      ],
    }));
    const props = { ...defaultProps };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Checked out');
    expect(button).toBeInTheDocument();
  });

  it('renders the check out button when the patient has an active visit and today is the appointment date and the check out button enabled', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [
        {
          patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDatetime: new Date().toISOString(),
          stopDatetime: null,
        },
      ],
    }));
    const props = { ...defaultProps, scheduleType: 'Scheduled' };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Check out');
    expect(button).toBeInTheDocument();
  });

  it('does not render check out button when the patient has an active visit and today is the appointment date but the check out button is disabled', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: false },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [
        {
          patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDatetime: new Date().toISOString(),
          stopDatetime: null,
        },
      ],
    }));
    const props = { ...defaultProps, scheduleType: 'Scheduled' };
    const { queryByText } = render(<AppointmentActions {...props} />);
    const button = queryByText('Check out');
    expect(button).not.toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is pending', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [],
    }));
    const props = { ...defaultProps, scheduleType: 'Pending' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: /actions/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is not pending', () => {
    useConfig.mockImplementation(() => ({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    useTodaysVisits.mockImplementation(() => ({
      visits: [],
    }));
    const props = { ...defaultProps, scheduleType: 'Confirmed' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: /actions/i });
    expect(button).toBeInTheDocument();
  });
});
