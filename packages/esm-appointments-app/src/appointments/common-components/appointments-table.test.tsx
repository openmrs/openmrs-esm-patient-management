import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { type Appointment } from '../../types';
import { downloadAppointmentsAsExcel } from '../../helpers/excel';
import AppointmentsTable from './appointments-table.component';

// Define mock appointments data for testing purposes
const appointments: Appointment = [
  {
    uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
    appointmentNumber: '00001',
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
  },
];

const mockDownloadAppointmentsAsExcel = downloadAppointmentsAsExcel as jest.Mock;

jest.mock('../../helpers/excel');
jest.mock('../../hooks/useOverlay');

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useConfig: jest.fn(() => ({
      customPatientChartUrl: 'someUrl',
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    })),
  };
});

describe('AppointmentsBaseTable', () => {
  const props = {
    appointments: [],
    isLoading: false,
    tableHeading: 'Scheduled',
    visits: [],
    scheduleType: 'Scheduled',
  };

  it('renders empty state if appointments data is unavailable', async () => {
    render(<AppointmentsTable {...props} />);

    await screen.findByRole('heading', { name: /scheduled appointment/i });

    const emptyScreenText = screen.getByText(/There are no Scheduled appointments to display/);
    expect(emptyScreenText).toBeInTheDocument();
  });

  it('renders a loading state when fetching data', () => {
    render(<AppointmentsTable {...props} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a tabular overview of the scheduled appointments', async () => {
    render(<AppointmentsTable {...props} appointments={appointments} />);

    await screen.findByRole('heading', { name: /scheduled appointment/i });

    expect(screen.getByText('Patient name')).toBeInTheDocument();
    expect(screen.getByText('Identifier')).toBeInTheDocument();
    const patient = screen.getByText('John Wilson');
    expect(patient).toBeInTheDocument();
    expect(patient).toHaveAttribute('href', 'someUrl');
  });

  it('updates the search string when the search input changes', async () => {
    const user = userEvent.setup();

    render(<AppointmentsTable {...props} appointments={appointments} />);

    await screen.findByRole('heading', { name: /scheduled appointment/i });

    const searchInput = screen.getByRole('searchbox');

    await user.type(searchInput, 'John');
    expect(searchInput).toHaveValue('John');
  });

  it("contians the titles 'Scheduled appointments' and Total count", async () => {
    render(<AppointmentsTable {...props} appointments={appointments} />);

    await screen.findByRole('heading', { name: /scheduled appointment/i });

    expect(screen.getByText(/Scheduled appointment/)).toBeInTheDocument();
    expect(screen.getByText(/Total 1/)).toBeInTheDocument();
  });

  it('Executes the download function when download button is clicked', async () => {
    const user = userEvent.setup();

    render(<AppointmentsTable {...props} appointments={appointments} />);

    await screen.findByRole('heading', { name: /scheduled appointment/i });

    const downloadButton = screen.getByRole('button', { name: /Download/ });

    await user.click(downloadButton);

    expect(downloadButton).toBeInTheDocument();
    expect(mockDownloadAppointmentsAsExcel).toHaveBeenCalledWith(appointments, expect.anything());
  });
});
