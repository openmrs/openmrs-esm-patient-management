import React from 'react';
import { render } from '@testing-library/react';
import AppointmentDetails from './appointment-details.component';

const appointment = {
  patientUuid: '12345',
  name: 'John Doe',
  identifier: '1234567890',
  dateTime: new Date().toISOString(),
  serviceType: 'Service',
  provider: 'Dr. Provider',
  id: '1',
  age: '30',
  gender: 'M',
  providers: [],
  appointmentKind: 'Scheduled',
  appointmentNumber: '12345',
  location: 'Location',
  phoneNumber: '1234567890',
  status: 'Status',
  comments: 'Some comments',
  dob: new Date('1992-01-01T00:00:00.000Z').toISOString(),
  serviceUuid: '12345',
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

test('renders appointment details correctly', () => {
  const { getByText } = render(<AppointmentDetails appointment={appointment} />);
  expect(getByText('Service')).toBeInTheDocument();
  expect(getByText('1992-01-01T00:00:00.000Z')).toBeInTheDocument();
  expect(getByText('Patient name :')).toBeInTheDocument();
  expect(getByText('John Doe')).toBeInTheDocument();
  expect(getByText('Age :')).toBeInTheDocument();
  expect(getByText('30')).toBeInTheDocument();
  expect(getByText('Gender :')).toBeInTheDocument();
  expect(getByText('Male')).toBeInTheDocument();
  expect(getByText('Dob :')).toBeInTheDocument();
  expect(getByText('1992-01-01T00:00:00.000Z')).toBeInTheDocument();
  expect(getByText('Phone number :')).toBeInTheDocument();
  expect(getByText('1234567890')).toBeInTheDocument();
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
