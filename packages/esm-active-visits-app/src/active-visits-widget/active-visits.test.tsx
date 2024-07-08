import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { useActiveVisits } from './active-visits.resource';
import ActiveVisitsTable from './active-visits.component';

const mockUseActiveVisits = useActiveVisits as jest.Mock;

jest.mock('./active-visits.resource', () => ({
  ...jest.requireActual('./active-visits.resource'),
  useActiveVisits: jest.fn(),
}));

const mockUseConfig = useConfig as jest.Mock;

describe('ActiveVisitsTable', () => {
  beforeEach(() => mockUseActiveVisits.mockReset());

  it('renders data table with active visits', () => {
    mockUseActiveVisits.mockImplementation(() => ({
      activeVisits: [{ id: '1', name: 'John Doe', visitType: 'Checkup', patientUuid: 'uuid1' }],
      isLoading: false,
      isValidating: false,
      error: null,
    }));
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

  it('filters active visits based on search input', async () => {
    const user = userEvent.setup();

    mockUseActiveVisits.mockImplementation(() => ({
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
    expect(screen.queryByText('Some One')).not.toBeInTheDocument();
  });

  it('displays empty state when there are no active visits', () => {
    mockUseActiveVisits.mockImplementation(() => ({
      activeVisits: [],
      isLoading: false,
      isValidating: false,
      error: null,
    }));

    render(<ActiveVisitsTable />);

    expect(screen.getByText('There are no active visits to display for this location.')).toBeInTheDocument();
  });

  it('should not display the table when the data is loading', () => {
    mockUseActiveVisits.mockImplementation(() => ({
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
    mockUseActiveVisits.mockImplementation(() => ({
      activeVisits: undefined,
      isLoading: false,
      isValidating: false,
      error: 'Error in fetching data',
    }));

    render(<ActiveVisitsTable />);

    expect(screen.getByText(/Error State/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should display the pagination when pagination is true', () => {
    mockUseActiveVisits.mockImplementation(() => ({
      activeVisits: [
        { id: '1', name: 'John Doe', visitType: 'Checkup' },
        { id: '2', name: 'Some One', visitType: 'Checkup' },
      ],
      isLoading: false,
      isValidating: false,
      error: null,
    }));

    render(<ActiveVisitsTable />);
  });
});
