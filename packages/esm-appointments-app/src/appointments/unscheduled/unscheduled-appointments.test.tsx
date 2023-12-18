import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useUnscheduledAppointments } from '../../hooks/useUnscheduledAppointments';
import { downloadUnscheduledAppointments } from '../../helpers/excel';
import { usePagination } from '@openmrs/esm-framework';
import UnscheduledAppointments from './unscheduled-appointments.component';

const mockUsePagination = usePagination as jest.Mock;
const mockGoToPage = jest.fn();
const mockDownloadAppointmentsAsExcel = downloadUnscheduledAppointments as jest.Mock;
const mockUseUnscheduledAppointments = useUnscheduledAppointments as jest.Mock;

jest.mock('../../helpers/excel');
jest.mock('../../hooks/useOverlay');
jest.mock('../../hooks/useUnscheduledAppointments');

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    useConfig: jest.fn(() => ({
      customPatientChartUrl: 'someUrl',
    })),
  };
});

describe('UnscheduledAppointments component', () => {
  const mockUnscheduledAppointments = [
    {
      uuid: '1234',
      name: 'Test Patient',
      identifier: '1234-56-78',
      gender: 'M',
      phoneNumber: '123-456-7890',
      age: 20,
      dob: 1262304000,
    },
    {
      uuid: '5678',
      name: 'Another Patient',
      identifier: '2345-67-89',
      gender: 'F',
      phoneNumber: '',
      age: 30,
      dob: 1262304000,
    },
  ];

  it('renders the component correctly', async () => {
    mockUseUnscheduledAppointments.mockReturnValue({
      isLoading: false,
      data: mockUnscheduledAppointments,
      error: null,
    });

    mockUsePagination.mockReturnValue({
      results: mockUnscheduledAppointments.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
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

    mockUsePagination.mockReturnValue({
      results: mockUnscheduledAppointments.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
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

    mockUsePagination.mockReturnValue({
      results: mockUnscheduledAppointments.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
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

    mockUsePagination.mockReturnValue({
      results: mockUnscheduledAppointments.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
    });

    render(<UnscheduledAppointments />);

    const emptyState = await screen.findByText('There are no unscheduled appointments to display');
    expect(emptyState).toBeInTheDocument();
  });
});
