import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockMappedAppointmentsData } from '../../../../../__mocks__/appointments.mock';
import { MappedAppointment } from '../../types';
import AppointmentsBaseTable from './appointments-base-table.component';
import { usePagination } from '@openmrs/esm-framework';

const mockUsePagination = usePagination as jest.Mock;
const mockGoToPage = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  usePagination: jest.fn(),
}));

xdescribe('AppointmentsBaseTable', () => {
  const tableHeading = 'Scheduled';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders a loading state when appointments data is being fetched', () => {
    mockUsePagination.mockReturnValue({
      results: [],
      goTo: mockGoToPage,
      currentPage: 1,
    });
    renderAppointmentsBaseTable([], true, tableHeading);

    expect(screen.queryByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error state view if appointments data is unavailable', () => {
    mockUsePagination.mockReturnValue({
      results: mockMappedAppointmentsData.data.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
    });
    renderAppointmentsBaseTable([], false, tableHeading);
    expect(screen.getByText(/There are no scheduled appointments to display/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of appointments data when available', async () => {
    mockUsePagination.mockReturnValue({
      results: mockMappedAppointmentsData.data.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
    });
    renderAppointmentsBaseTable(mockMappedAppointmentsData.data, false, tableHeading);

    expect(screen.queryByText(/There are no scheduled appointments to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    const expectedColumnHeaders = [/Patient name/, /Date & Time/, /Service Type/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /John Wilson 30-Aug-2021, 03:35 PM HIV Clinic HIV Clinic Start open and close list of options/,
      /Eric Test Ric 10-Sept-2021, 03:50 PM TB Clinic Clinic Start open and close list of options/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.queryByRole('row', { name: new RegExp(row, 'i') })).not.toBeInTheDocument();
    });

    expect(screen.getByRole('searchbox')).toBeInTheDocument();

    // TODO: Add tests for the filtering functionality and the service type dropdown
  });
});

function renderAppointmentsBaseTable(appointments: Array<MappedAppointment>, isLoading = false, tableHeading = '') {
  render(<AppointmentsBaseTable appointments={appointments} isLoading={isLoading} tableHeading={tableHeading} />);
}
