import { render, screen } from '@testing-library/react';
import React from 'react';
import AppointmentActions from './appointments-actions.component';
import { type Appointment } from '../../types';

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
    birthDate: '1986-04-03T00:00:00.000+0000',
    phoneNumber: '0700000000',
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

describe('AppointmentActions', () => {
  const defaultProps = {
    visits: [],
    appointment: appointment,
    scheduleType: 'Pending',
    mutate: () => {},
  };

  beforeAll(() => {
    jest.useFakeTimers();

    const currentDateTime = new Date();
    currentDateTime.setHours(12);
    currentDateTime.setMinutes(0);

    jest.setSystemTime(currentDateTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the correct button when the patient has checked out', () => {
    const visits = [
      {
        patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
        startDatetime: new Date().toISOString(),
        stopDatetime: new Date().toISOString(),
      },
    ];
    const props = { ...defaultProps, visits };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Checked out');
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when the patient has an active visit and today is the appointment date', () => {
    const visits = [
      {
        patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
        startDatetime: new Date().toISOString(),
        stopDatetime: null,
      },
    ];
    const props = { ...defaultProps, visits, scheduleType: 'Scheduled' };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Check out');
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is pending', () => {
    const props = { ...defaultProps, scheduleType: 'Pending' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: /actions/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is not pending', () => {
    const props = { ...defaultProps, scheduleType: 'Confirmed' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: /actions/i });
    expect(button).toBeInTheDocument();
  });
});
