import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockSession } from '__mocks__';
import { usePagination } from '@openmrs/esm-framework';
import { useTodaysAppointments } from './home-appointments.resource';
import AppointmentsBaseTable from './appointments-base-table.component';

const useTodaysAppointmentsMock = useTodaysAppointments as jest.Mock;
const usePaginationMock = usePagination as jest.Mock;

jest.mock('./home-appointments.resource');

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn(() => ({ user: { mockSession } })),
  useConfig: jest.fn(() => ({
    useBahmniAppointmentsUI: false,
    useFullViewPrivilege: false,
    fullViewPrivilege: 'somePrivilege',
    customPatientChartUrl: 'someUrl',
  })),
  userHasAccess: jest.fn(() => true),
}));

describe('AppointmentsBaseTable', () => {
  it('renders loading skeleton when loading', () => {
    useTodaysAppointmentsMock.mockImplementationOnce(() => ({
      appointments: [],
      isLoading: true,
      isValidating: false,
    }));

    render(<AppointmentsBaseTable />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders no appointments message when no appointments are available', () => {
    useTodaysAppointmentsMock.mockImplementationOnce(() => ({
      appointments: [],
      isLoading: false,
      isValidating: false,
    }));

    render(<AppointmentsBaseTable />);
    expect(
      screen.getByText(/There are no appointments scheduled for today to display for this location/i),
    ).toBeInTheDocument();
  });

  it('renders appointments and actions', () => {
    useTodaysAppointmentsMock.mockImplementation(() => ({
      appointments: [
        {
          uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
          appointmentNumber: '0000',
          patient: {
            identifier: '100GEJ',
            name: 'John Wilson',
            uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
            gender: 'M',
            age: 35,
            birthdate: '1986-04-03T00:00:00.000+0000',
            phoneNumber: '0700000000',
          },
          service: {
            appointmentServiceId: 1,
            name: 'Outpatient',
            description: null,
            speciality: {},
            startTime: '',
            endTime: '',
            maxAppointmentsLimit: null,
            durationMins: null,
            location: {},
            uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
            initialAppointmentStatus: 'Scheduled',
            creatorName: null,
          },
          serviceType: {
            display: 'HIV Clinic',
            uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1',
            duration: 15,
          },
          provider: {
            uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
            person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
          },
          location: { name: 'HIV Clinic', uuid: '2131aff8-2e2a-480a-b7ab-4ac53250262b' },
          startDateTime: new Date().toISOString(),
          endDateTime: null,
          appointmentKind: 'WalkIn',
          status: 'Scheduled',
          comments: 'Walk in appointments',
          additionalInfo: null,
          providers: [{ uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' }],
          recurring: false,
        },
      ],
      isLoading: false,
      isValidating: false,
    }));
    usePaginationMock.mockImplementationOnce(() => ({
      goto: jest.fn(),
      currentPage: 1,
      results: [
        {
          uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
          appointmentNumber: '0000',
          patient: {
            identifier: '100GEJ',
            name: 'John Wilson',
            uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
            gender: 'M',
            age: 35,
            birthdate: '1986-04-03T00:00:00.000+0000',
            phoneNumber: '0700000000',
          },
          service: {
            appointmentServiceId: 1,
            name: 'Outpatient',
            description: null,
            speciality: {},
            startTime: '',
            endTime: '',
            maxAppointmentsLimit: null,
            durationMins: null,
            location: {},
            uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
            initialAppointmentStatus: 'Scheduled',
            creatorName: null,
          },
          serviceType: {
            display: 'HIV Clinic',
            uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1',
            duration: 15,
          },
          provider: {
            uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
            person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
          },
          location: { name: 'HIV Clinic', uuid: '2131aff8-2e2a-480a-b7ab-4ac53250262b', display: 'HIV Clinic' },
          startDateTime: new Date().toISOString(),
          endDateTime: null,
          appointmentKind: 'WalkIn',
          status: 'Scheduled',
          comments: 'Walk in appointments',
          additionalInfo: null,
          providers: [{ uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' }],
          recurring: false,
        },
      ],
    }));
    render(<AppointmentsBaseTable />);

    // Assert that appointment data is displayed
    const patient = screen.getByText('John Wilson');
    expect(patient).toBeInTheDocument();
    expect(patient).toHaveAttribute('href', 'someUrl');
    expect(screen.getByText('100GEJ')).toBeInTheDocument();
    expect(screen.getByText('Outpatient')).toBeInTheDocument();
    expect(screen.getByText('HIV Clinic')).toBeInTheDocument();
    expect(screen.getByText('HIV Clinic')).toBeInTheDocument();
  });
});
