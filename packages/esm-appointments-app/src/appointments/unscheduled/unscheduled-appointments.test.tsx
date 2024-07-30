import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { getByTextWithMarkup } from 'tools';
import { useUnscheduledAppointments } from '../../hooks/useUnscheduledAppointments';
import { downloadUnscheduledAppointments } from '../../helpers/excel';
import UnscheduledAppointments from './unscheduled-appointments.component';

const mockDownloadAppointmentsAsExcel = jest.mocked(downloadUnscheduledAppointments);
const mockUseUnscheduledAppointments = jest.mocked(useUnscheduledAppointments);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('../../helpers/excel');
jest.mock('../../hooks/useOverlay');
jest.mock('../../hooks/useUnscheduledAppointments');

const mockUnscheduledAppointments = [
  {
    age: 20,
    dob: 1262304000,
    dateTime: new Date(),
    gender: 'M',
    identifier: '1234-56-78',
    name: 'Test Patient',
    phoneNumber: '123-456-7890',
    uuid: '1234',
  },
  {
    age: 30,
    dob: 1262304000,
    dateTime: new Date(),
    gender: 'F',
    identifier: '2345-67-89',
    name: 'Another Patient',
    phoneNumber: '',
    uuid: '5678',
  },
];

describe('UnscheduledAppointments', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      customPatientChartUrl: 'someUrl',
    });
  });

  it('renders the component correctly', async () => {
    mockUseUnscheduledAppointments.mockReturnValue({
      isLoading: false,
      data: mockUnscheduledAppointments,
      error: null,
    });

    render(<UnscheduledAppointments />);

    const header = screen.getByText('Unscheduled appointments 2');
    expect(header).toBeInTheDocument();

    const patientName = await screen.findByText('Test Patient');
    expect(patientName).toBeInTheDocument();
    expect(patientName).toHaveAttribute('href', 'someUrl');

    const identifier = screen.getByText('1234-56-78');
    expect(identifier).toBeInTheDocument();

    const gender = screen.getByText('Male');
    expect(gender).toBeInTheDocument();

    const phoneNumber = screen.getByText('123-456-7890');
    expect(phoneNumber).toBeInTheDocument();
  });

  it('allows the user to search for appointments', async () => {
    const user = userEvent.setup();

    mockUseUnscheduledAppointments.mockReturnValue({
      isLoading: false,
      data: mockUnscheduledAppointments,
      error: null,
    });

    render(<UnscheduledAppointments />);

    const searchInput = await screen.findByRole('searchbox');
    await user.type(searchInput, 'Another');

    const patientName = screen.getByText('Another Patient');
    expect(patientName).toBeInTheDocument();

    const identifier = screen.getByText('2345-67-89');
    expect(identifier).toBeInTheDocument();

    const gender = screen.getByText('Female');
    expect(gender).toBeInTheDocument();

    const phoneNumber = screen.getByText('--');
    expect(phoneNumber).toBeInTheDocument();
  });

  it('allows the user to download a list of unscheduled appointments', async () => {
    const user = userEvent.setup();

    mockUseUnscheduledAppointments.mockReturnValue({
      isLoading: false,
      data: mockUnscheduledAppointments,
      error: null,
    });

    render(<UnscheduledAppointments />);
    const downloadButton = await screen.findByText('Download');
    expect(downloadButton).toBeInTheDocument();
    await user.click(downloadButton);
    expect(mockDownloadAppointmentsAsExcel).toHaveBeenCalledWith(mockUnscheduledAppointments);
  });

  it('renders a message if there are no unscheduled appointments', async () => {
    mockUseUnscheduledAppointments.mockReturnValue({
      isLoading: false,
      data: [],
      error: null,
    });

    render(<UnscheduledAppointments />);
    expect(getByTextWithMarkup('There are no unscheduled appointments to display')).toBeInTheDocument();
  });
});
