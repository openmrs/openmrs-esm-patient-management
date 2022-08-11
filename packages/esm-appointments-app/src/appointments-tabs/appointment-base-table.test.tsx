import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { renderWithSwr } from '../../../../tools/test-helpers';
import { mockMappedAppointmentsData } from '../../../../__mocks__/appointments.mock';
import AppointmentsBaseTable from './appointments-base-table.component';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});

describe('AppointmentsBaseTable: ', () => {
  // TODO Dennis please fix this
  it.skip('renders an empty state view if data is unavailable', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderAppointmentsBaseTable();
    expect(screen.queryByText(/no appointments to display/i)).not.toBeInTheDocument();
  });

  // TODO Dennis please fix this
  it.skip('renders a tabular overview of appointment data when available', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: mockMappedAppointmentsData } });

    renderAppointmentsBaseTable();

    // await waitForLoadingToFinish();
    expect(screen.getByText(/add new appointment/i)).toBeInTheDocument();
    expect(screen.queryByText(/no appointments to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /eric test ric/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john wilson/i })).toBeInTheDocument();
    expect(screen.getAllByText(/hiv clinic/i));
    expect(screen.getAllByText(/tb clinic/i));
    expect(screen.getAllByText(/start/i));

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

    expect(screen.getAllByText(/HIV Clinic/i));
    expect(screen.getAllByText(/TB Clinic/i));

    // filter table by typing in the searchbox
    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'John');

    expect(screen.queryByText(/eric test/i)).not.toBeInTheDocument();

    userEvent.clear(searchbox);
    userEvent.type(searchbox, 'gibberish');

    expect(screen.queryByText(/john wilson/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/eric test/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no patients to display/i)).not.toBeInTheDocument();
  });
});

describe('AppointmentsBaseTableLoader: ', () => {
  it('renders loader when data is loading', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderAppointmentsBaseTableLoader();

    expect(screen.queryByRole('progressbar')).toBeInTheDocument();
  });
});

function renderAppointmentsBaseTable() {
  renderWithSwr(
    <AppointmentsBaseTable
      appointments={mockMappedAppointmentsData.data}
      isLoading={false}
      tableHeading={'Booked appointments'}
    />,
  );
}

function renderAppointmentsBaseTableLoader() {
  renderWithSwr(<AppointmentsBaseTable appointments={[]} isLoading={true} tableHeading={'Completed appointments'} />);
}
