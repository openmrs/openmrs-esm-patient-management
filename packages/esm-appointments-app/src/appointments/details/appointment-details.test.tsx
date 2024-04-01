import React from 'react';
import { render } from '@testing-library/react';
import AppointmentDetails from './appointment-details.component';
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
  startDateTime: 1630326900000,
  endDateTime: 1630327200000,
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

jest.mock('../../hooks/usePatientAppointmentHistory', () => ({
  usePatientAppointmentHistory: () => ({
    appointmentsCount: {
      completedAppointments: 1,
      missedAppointments: 2,
      cancelledAppointments: 3,
      upcomingAppointments: 4,
    },
  }),
}));

jest.mock('../../hooks/usePatientDetails', () => ({
  usePatientDetails: () => ({
    patientDetails: {
      dateOfBirth: '22-Mar-2020',
    },
  }),
}));
test('renders appointment details correctly', () => {
  const { getByText } = render(<AppointmentDetails appointment={appointment} />);
  expect(getByText('Patient name :')).toBeInTheDocument();
  expect(getByText('John Wilson')).toBeInTheDocument();
  expect(getByText('Age :')).toBeInTheDocument();
  expect(getByText('35')).toBeInTheDocument();
  expect(getByText('Gender :')).toBeInTheDocument();
  expect(getByText('Male')).toBeInTheDocument();
  expect(getByText('Date of birth :')).toBeInTheDocument();
  expect(getByText('Appointment Notes')).toBeInTheDocument();
  expect(getByText('Some comments')).toBeInTheDocument();
  expect(getByText('Appointment History')).toBeInTheDocument();
  expect(getByText('Completed')).toBeInTheDocument();
  expect(getByText('1')).toBeInTheDocument();
  expect(getByText('Missed')).toBeInTheDocument();
  expect(getByText('2')).toBeInTheDocument();
  expect(getByText('Cancelled')).toBeInTheDocument();
  expect(getByText('3')).toBeInTheDocument();
  expect(getByText('Upcoming')).toBeInTheDocument();
  expect(getByText('4')).toBeInTheDocument();
});
