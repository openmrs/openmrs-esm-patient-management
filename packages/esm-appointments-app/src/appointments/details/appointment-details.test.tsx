import React from 'react';
import { render, screen } from '@testing-library/react';
import { type Appointment } from '../../types';
import AppointmentDetails from './appointment-details.component';

const appointment: Appointment = {
  uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
  appointmentNumber: '0000',
  patient: {
    identifier: '100GEJ',
    identifiers: [],
    name: 'John Wilson',
    uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    gender: 'M',
    age: '34',
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

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    usePatient: jest.fn().mockImplementation((...args) => ({
      patient: {
        birthDate: '22-Mar-2020',
        telecom: [
          {
            uuid: 'tel-uuid-1',
            value: '0899129989932',
          },
        ],
      },
    })),
  };
});

test('renders appointment details correctly', async () => {
  render(<AppointmentDetails appointment={appointment} />);
  expect(screen.getByText(/Patient name/i)).toBeInTheDocument();
  expect(screen.getByText(/John Wilson/i)).toBeInTheDocument();
  expect(screen.getByText(/Age/i)).toBeInTheDocument();
  expect(screen.getByText(/34/i)).toBeInTheDocument();
  expect(screen.getByText(/Gender/i)).toBeInTheDocument();
  expect(screen.getByText(/Male/i)).toBeInTheDocument();
  expect(screen.getByText(/Date of birth/i)).toBeInTheDocument();
  expect(screen.getByText(/Date of birth/i)).toBeInTheDocument();
  expect(screen.getByText(/22-Mar-2020/i)).toBeInTheDocument();
  expect(screen.getByText(/Contact 1/i)).toBeInTheDocument();
  expect(screen.getByText(/0899129989932/i)).toBeInTheDocument();
  expect(screen.getByText(/Appointment Notes/i)).toBeInTheDocument();
  expect(screen.getByText(/Some comments/i)).toBeInTheDocument();
  expect(screen.getByText(/Appointment History/i)).toBeInTheDocument();
  expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  expect(screen.getByText('1', { exact: true })).toBeInTheDocument();
  expect(screen.getByText(/Missed/i)).toBeInTheDocument();
  expect(screen.getByText('2', { exact: true })).toBeInTheDocument();
  expect(screen.getByText(/Cancelled/i)).toBeInTheDocument();
  expect(screen.getByText('3', { exact: true })).toBeInTheDocument();
  expect(screen.getByText(/Upcoming/i)).toBeInTheDocument();
  expect(screen.getByText('4', { exact: true })).toBeInTheDocument();
});
