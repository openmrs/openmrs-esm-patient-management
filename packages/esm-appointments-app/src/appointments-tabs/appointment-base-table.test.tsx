import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockMappedAppointmentsData } from '../../../../__mocks__/appointments.mock';
import { MappedAppointment } from '../types';
import AppointmentsBaseTable from './appointments-base-table.component';

describe('AppointmentsBaseTable', () => {
  const tableHeading = 'Booked appointments';

  it('renders a loading state when appointments data is being fetched', () => {
    renderAppointmentsBaseTable([], true, tableHeading);

    expect(screen.queryByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error state view if appointments data is unavailable', () => {
    renderAppointmentsBaseTable([], false, tableHeading);

    expect(screen.getByRole('button', { name: /add new appointment/i })).toBeInTheDocument();
    expect(screen.getByText(/no appointments to display/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of appointments data when available', async () => {
    renderAppointmentsBaseTable(mockMappedAppointmentsData.data, false, tableHeading);

    expect(screen.getByRole('button', { name: /add new appointment/i })).toBeInTheDocument();
    expect(screen.queryByText(/no appointments to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/booked appointments/i)).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /selected service/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /eric test ric/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john wilson/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /date & time/, /service type/, /provider/, /location/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /John Wilson 30-Aug-2021, 03:35 PM HIV Clinic Dr John Cook HIV Clinic Start open and close list of options/,
      /Eric Test Ric 10-Sept-2021, 03:50 PM TB Clinic Dr John Cook TB Clinic Start open and close list of options/,
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
