import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockSession } from '__mocks__';
import { usePagination } from '@openmrs/esm-framework';
import { useTodaysAppointments } from './home-appointments.resource';
import AppointmentsBaseTable from './appointments-list.component';

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
    useTodaysAppointmentsMock.mockImplementationOnce(() => ({
      appointments: [
        {
          id: '1',
          dateTime: '2023-08-18 10:00 AM',
          name: 'John Doe',
          identifier: 'JD123',
          location: 'Clinic A',
          serviceColor: 'blue',
          serviceType: 'Checkup',
          status: 'Scheduled',
          patientUuid: 'some-uuid',
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
          id: '2',
          dateTime: '2023-08-18 10:00 AM',
          name: 'John Doe',
          identifier: 'JD123',
          location: 'Clinic A',
          serviceColor: 'blue',
          serviceType: 'Checkup',
          status: 'Scheduled',
          patientUuid: 'some-uuid',
        },
      ],
    }));
    render(<AppointmentsBaseTable />);

    // Assert that appointment data is displayed
    expect(screen.getByText('2023-08-18 10:00 AM')).toBeInTheDocument();
    const patient = screen.getByText('John Doe');
    expect(patient).toBeInTheDocument();
    expect(patient).toHaveAttribute('href', 'someUrl');
    expect(screen.getByText('JD123')).toBeInTheDocument();
    expect(screen.getByText('Clinic A')).toBeInTheDocument();
    expect(screen.getByText('Checkup')).toBeInTheDocument();
  });
});
