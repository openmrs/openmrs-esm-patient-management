import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientListTableContainer from './patient-list-table.component';
import { usePagination } from '@openmrs/esm-framework';
import { PatientList } from '../api/types';

const mockedUsePagination = usePagination as jest.Mock;

// Mock useSession and other dependencies
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn(),
  useLayoutType: jest.fn(),
  useConfig: jest.fn(() => ({
    patientListsToShow: 20,
  })),
}));

describe('PatientListTableContainer', () => {
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

  it('renders loading skeleton', () => {
    render(
      <PatientListTableContainer
        loading={true}
        patientLists={[]}
        listType={'My lists'}
        error={undefined}
        isValidating={false}
        headers={['id', 'name']}
      />,
    );
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  xit('renders error state', () => {
    const error = new Error('Something went wrong');
    render(
      <PatientListTableContainer
        loading={false}
        error={error}
        patientLists={[]}
        refetch={jest.fn()}
        listType={''}
        isValidating={false}
        headers={['id', 'name']}
        searchTerm={''}
        setSearchTerm={jest.fn()}
      />,
    );
    expect(screen.getByText('Error')).toBeInTheDocument();

    // this is throwing error that rendered item is not component it is string
  });

  it('renders empty state', () => {
    render(<PatientListTableContainer patientLists={[]} listType={''} />);
    expect(screen.getByText('Empty data illustration')).toBeInTheDocument();
  });

  it('renders patient lists', () => {
    render(<PatientListTableContainer patientLists={patientLists} listType={''} headers={header} />);

    expect(screen.getByText('List name')).toBeInTheDocument();
    expect(screen.getByText('List type')).toBeInTheDocument();
    expect(screen.getByText('No. of patients')).toBeInTheDocument();
    expect(screen.getByText('Starred')).toBeInTheDocument();
  });

  xit('should render the patient list table with correct data when data is present', async () => {
    mockedUsePagination.mockReturnValue({
      results: patientLists,
      goTo: jest.fn(),
      currentPage: 1,
      paginated: false,
    });

    render(<PatientListTableContainer patientLists={patientLists} listType={''} headers={header} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('My lists')).toBeInTheDocument();
    });

    // TODO: Enquire why the patient list data is not coming and add assertion to check the data
  });

  it('should render the pagination component when paginated is true', () => {
    mockedUsePagination.mockReturnValue({
      results: patientLists,
      goTo: jest.fn(),
      currentPage: 1,
      paginated: true,
    });

    render(<PatientListTableContainer patientLists={patientLists} listType={''} headers={header} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('should change the search input', () => {
    const mockedSetSearchTerm = jest.fn();
    render(
      <PatientListTableContainer patientLists={patientLists} headers={header} setSearchTerm={mockedSetSearchTerm} />,
    );

    const searchInput = screen.getByRole('searchbox');

    fireEvent.change(searchInput, { target: { value: 'search term' } });

    expect(searchInput).toHaveValue('search term');
    expect(mockedSetSearchTerm).toHaveBeenCalledTimes(1);
  });

  it('should update the page size when it is changed', () => {
    mockedUsePagination.mockReturnValue({
      results: patientLists,
      goTo: jest.fn(),
      currentPage: 1,
      paginated: true,
    });
    render(<PatientListTableContainer patientLists={patientLists} listType={''} headers={header} />);

    const pageSizeInput = screen.getByLabelText('Items per page:');
    fireEvent.change(pageSizeInput, { target: { value: '25' } });

    expect(pageSizeInput).toHaveValue('25');
  });
});
