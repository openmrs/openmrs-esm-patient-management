import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientListTableContainer from './patient-list-table.component';
import { useSession } from '@openmrs/esm-framework';
import { mockSession } from '../../../../__mocks__/session.mock';
import { PatientList } from '../api/types';

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

const header = [
  { header: 'List name', key: '1' },
  { header: 'List type', key: '2' },
  { header: 'No. of patients', key: '3' },
  { header: 'Starred', key: '4' },
];

describe('PatientListTableContainer', () => {
  beforeEach(() => mockedUseSession.mockReturnValue(mockSession.data));

  it('renders a loading state when patient list data is getting fetched', () => {
    render(
      <PatientListTableContainer
        error={null}
        headers={['id', 'name']}
        isLoading
        isValidating={false}
        listType={'My lists'}
        patientLists={[]}
      />,
    );

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
      <PatientListTableContainer
        error={error}
        headers={['id', 'name']}
        isLoading={false}
        isValidating={false}
        listType={''}
        patientLists={[]}
        refetch={jest.fn()}
        searchTerm={''}
        setSearchTerm={jest.fn()}
      />,
    );

    expect(screen.getByText(/401:\s*unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  it('renders an empty state when there is no patient list data to display', () => {
    render(<PatientListTableContainer patientLists={[]} listType={''} />);

    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no patient lists to display/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the available patient lists in a datatable', () => {
    render(<PatientListTableContainer patientLists={patientLists} listType={''} headers={header} />);

    const headers = ['List name', 'List type', 'No. of patients', 'Starred'];

    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });
  });
});
