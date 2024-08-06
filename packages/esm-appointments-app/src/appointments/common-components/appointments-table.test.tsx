import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import type { Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import { downloadAppointmentsAsExcel } from '../../helpers/excel';
import { getByTextWithMarkup } from 'tools';
import AppointmentsTable from './appointments-table.component';

const defaultProps = {
  appointments: [],
  isLoading: false,
  scheduleType: 'Scheduled',
  tableHeading: 'scheduled',
  visits: [],
};

const mockAppointments = [
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
    appointmentKind: 'WalkIn' as AppointmentKind,
    status: 'Scheduled' as AppointmentStatus,
    comments: 'Some comments',
    additionalInfo: null,
    providers: [{ uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' }],
    recurring: false,
    voided: false,
    teleconsultationLink: null,
    extensions: [],
  },
] as unknown as Array<Appointment>;

const mockDownloadAppointmentsAsExcel = jest.mocked(downloadAppointmentsAsExcel);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('../../helpers/excel');
jest.mock('../../hooks/useOverlay');

describe('AppointmentsTable', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      customPatientChartUrl: 'url-to-patient-chart',
      checkInButton: { enabled: false, showIfActiveVisit: false, customUrl: null },
      checkOutButton: { enabled: false, customUrl: null },
    });
  });

  it('renders an empty state if appointments data is unavailable', async () => {
    renderAppointmentsTable();

    await screen.findByRole('heading', { name: /scheduled appointment/i });

    expect(getByTextWithMarkup('There are no scheduled appointments to display')).toBeInTheDocument();
  });

  it('renders a loading state when fetching data', () => {
    renderAppointmentsTable({ isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a tabular overview of the scheduled appointments', async () => {
    renderAppointmentsTable({ appointments: mockAppointments });

    await screen.findByRole('heading', { name: /scheduled appointment/i });
    expect(screen.getByRole('search', { name: /filter table/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /john wilson 100gej hiv clinic outpatient/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john wilson/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john wilson/i })).toHaveAttribute('href', 'url-to-patient-chart');
  });

  it('updates the search string when the search input changes', async () => {
    const user = userEvent.setup();

    renderAppointmentsTable({ appointments: mockAppointments });

    await screen.findByRole('heading', { name: /scheduled appointment/i });
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'John');
    expect(searchInput).toHaveValue('John');
  });

  it('clicking the download button should download the scheduled appointments as an excel file', async () => {
    const user = userEvent.setup();

    renderAppointmentsTable({ appointments: mockAppointments });

    await screen.findByRole('heading', { name: /scheduled appointment/i });
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);
    expect(downloadButton).toBeInTheDocument();
    expect(mockDownloadAppointmentsAsExcel).toHaveBeenCalledWith(mockAppointments, expect.anything());
  });
});

function renderAppointmentsTable(props = {}) {
  render(<AppointmentsTable {...defaultProps} {...props} />);
}
