import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import { useActiveVisits } from './active-visits.resource';
import ActiveVisitsTable from './active-visits.component';

const mockedUsePagination = usePagination as jest.Mock;
const mockActiveVisits = useActiveVisits as jest.Mock;

const mockActiveVisitsData = [{ id: '1', name: 'John Doe', visitType: 'Checkup', patientUuid: 'uuid1' }];

jest.mock('./active-visits.resource', () => ({
  ...jest.requireActual('./active-visits.resource'),
  useActiveVisits: jest.fn(() => ({
    activeVisits: mockActiveVisitsData,
    isLoading: false,
    isValidating: false,
    error: null,
  })),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  ErrorState: jest.fn(() => (
    <div>
      Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site
      administrator and quote the error code above.
    </div>
  )),
  useConfig: jest.fn(() => ({ activeVisits: { pageSizes: [10, 20, 30, 40, 50], pageSize: 10 } })),
  usePagination: jest.fn().mockImplementation((data) => ({
    currentPage: 1,
    goTo: () => {},
    results: data,
    paginated: false,
  })),
}));

describe('ActiveVisitsTable', () => {
  it('renders data table with active visits', () => {
    render(<ActiveVisitsTable />);

    expect(screen.getByText('Visit Time')).toBeInTheDocument();
    expect(screen.getByText('ID Number')).toBeInTheDocument();
    const expectedColumnHeaders = [/Visit Time/, /ID Number/, /Name/, /Gender/, /Age/, /Visit Type/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const patientNameLink = screen.getByText('John Doe');
    expect(patientNameLink).toBeInTheDocument();
    expect(patientNameLink.tagName).toBe('A');
  });

  it.skip('filters active visits based on search input', async () => {
    const user = userEvent.setup();

    mockActiveVisits.mockImplementationOnce(() => ({
      activeVisits: [
        { id: '1', name: 'John Doe', visitType: 'Checkup', patientUuid: 'uuid1' },
        { id: '2', name: 'Some One', visitType: 'Checkup', patientUuid: 'uuid2' },
      ],
      isLoading: false,
      isValidating: false,
      error: null,
    }));
    render(<ActiveVisitsTable />);

    const searchInput = screen.getByPlaceholderText('Filter table');
    await user.type(searchInput, 'John');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Some One')).toBeNull();
  });

  it('displays empty state when there are no active visits', () => {
    mockActiveVisits.mockImplementationOnce(() => ({
      activeVisits: [],
      isLoading: false,
      isValidating: false,
      error: null,
    }));

    render(<ActiveVisitsTable />);

    expect(screen.getByText('There are no active visits to display for this location.')).toBeInTheDocument();
  });

  it('should not display the table when the data is loading', () => {
    mockActiveVisits.mockImplementationOnce(() => ({
      activeVisits: undefined,
      isLoading: true,
      isValidating: false,
      error: null,
    }));

    render(<ActiveVisitsTable />);

    const expectedColumnHeaders = [/Visit Time/, /ID Number/, /Name/, /Gender/, /Age/, /Visit Type/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.queryByRole('columnheader', { name: new RegExp(header, 'i') })).not.toBeInTheDocument();
    });
  });

  it('should display the error state when there is error', () => {
    mockActiveVisits.mockImplementationOnce(() => ({
      activeVisits: undefined,
      isLoading: false,
      isValidating: false,
      error: 'Error in fetching data',
    }));

    render(<ActiveVisitsTable />);

    expect(screen.getByText(/sorry, there was a problem displaying this information/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should display the pagination when pagination is true', () => {
    mockActiveVisits.mockImplementationOnce(() => ({
      activeVisits: [
        { id: '1', name: 'John Doe', visitType: 'Checkup' },
        { id: '2', name: 'Some One', visitType: 'Checkup' },
      ],
      isLoading: false,
      isValidating: false,
      error: null,
    }));
    mockedUsePagination.mockImplementationOnce((data) => ({
      currentPage: 1,
      goTo: () => {},
      results: data,
      paginated: true,
    }));
    render(<ActiveVisitsTable />);

    expect(screen.getByText(/Next Page/i)).toBeInTheDocument();
  });
});
