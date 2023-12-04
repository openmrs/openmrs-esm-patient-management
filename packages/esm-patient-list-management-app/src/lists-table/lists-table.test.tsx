import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from '@openmrs/esm-framework';
import { mockSession } from '../../../../__mocks__/session.mock';
import type { PatientList } from '../api/types';
import ListsTable from './lists-table.component';

const mockedUseSession = jest.mocked(useSession);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(() => ({
    patientListsToShow: 20,
  })),
}));

const patientLists: Array<PatientList> = [
  {
    id: '1',
    display: 'My lists',
    description: 'My Lists',
    type: 'List type',
    size: 10,
  },
];

const tableHeaders = [
  { header: 'List name', key: '1' },
  { header: 'List type', key: '2' },
  { header: 'No. of patients', key: '3' },
  { header: 'Starred', key: '4' },
];

describe('ListsTable', () => {
  beforeEach(() => mockedUseSession.mockReturnValue(mockSession.data));

  it('renders a loading state when patient list data is getting fetched', () => {
    render(<ListsTable error={null} headers={tableHeaders} isLoading listType={'My lists'} patientLists={[]} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error state when there is a problem loading patient list data', () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    render(
      <ListsTable
        error={error}
        headers={tableHeaders}
        isLoading={false}
        listType={''}
        patientLists={[]}
        refetch={jest.fn()}
      />,
    );

    expect(screen.getByText(/401:\s*unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  it('renders an empty state when there is no patient list data to display', () => {
    render(<ListsTable patientLists={[]} listType={''} />);

    expect(screen.getByTitle(/empty state illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no patient lists to display/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the available patient lists in a datatable', () => {
    render(<ListsTable patientLists={patientLists} listType={''} headers={tableHeaders} />);

    const headers = ['List name', 'List type', 'No. of patients', 'Starred'];

    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });
  });
});
