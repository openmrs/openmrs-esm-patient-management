import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockMappedAppointmentsData } from '__mocks__';
import { renderWithSwr } from 'tools';
import QueuePatientBaseTable from './queue-linelist-base-table.component';

const tableHeaders = [
  {
    id: 0,
    header: 'Name',
    key: 'name',
  },
  {
    id: 1,
    header: 'Return Date',
    key: 'returnDate',
  },
  {
    id: 2,
    header: 'Gender',
    key: 'gender',
  },
  {
    id: 3,
    header: 'Age',
    key: 'age',
  },
  {
    id: 4,
    header: 'Visit Type',
    key: 'visitType',
  },
  {
    id: 5,
    header: 'Phone Number',
    key: 'phoneNumber',
  },
];

const defaultProps = {
  title: 'Scheduled appointments',
  patientData: mockMappedAppointmentsData.data,
  headers: tableHeaders,
  serviceType: '',
  isLoading: false,
};

describe('QueuePatientBaseTable', () => {
  it('renders a tabular overview of appointments data when available', async () => {
    const user = userEvent.setup();

    renderQueueBaseTable();

    expect(screen.getByText(/scheduled appointments/i)).toBeInTheDocument();
    const expectedColumnHeaders = [/name/, /return date/, /gender/, /age/, /visit type/, /phone number/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /John Wilson Today, 02:08 PM Male 45 HIV Clinic 0700123456/,
      /Eric Test Ric Today, 02:08 PM Male 32 TB Clinic 0700987654/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.queryByRole('row', { name: new RegExp(row, 'i') })).not.toBeInTheDocument();
    });

    const searchBox = screen.getByRole('searchbox');
    await user.type(searchBox, 'John');

    expect(screen.getByText(/john wilson/i)).toBeInTheDocument();
    expect(screen.queryByText(/eric test ric/i)).not.toBeInTheDocument();

    await user.clear(searchBox);
    await user.type(searchBox, 'gibberish');
    expect(screen.queryByText(/john wilson/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/eric test ric/i)).not.toBeInTheDocument();
  });

  it('renders an empty state view if data is unavailable', async () => {
    renderQueueBaseTable({ patientData: [] });

    expect(screen.getByText(/scheduled appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/no patients to display/i)).toBeInTheDocument();
  });
});

function renderQueueBaseTable(props = {}) {
  renderWithSwr(<QueuePatientBaseTable {...defaultProps} {...props} />);
}
