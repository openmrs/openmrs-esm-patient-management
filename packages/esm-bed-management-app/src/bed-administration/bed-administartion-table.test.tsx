import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { useBedsGroupedByLocation } from '../summary/summary.resource';
import BedAdministrationTable from './bed-administration-table.component';

jest.mock('../summary/summary.resource', () => ({
  useBedsGroupedByLocation: jest.fn(),
}));

const mockUseBedsGroupedByLocation = jest.mocked(useBedsGroupedByLocation);
const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);

const mockMutateBeds = jest.fn();

const mockBeds = [
  [
    {
      id: 1,
      uuid: 'bed-uuid-1',
      bedNumber: 'BED-001',
      status: 'AVAILABLE' as const,
      row: 1,
      column: 1,
      location: { uuid: 'location-uuid-1', display: 'Ward A', name: 'Ward A' },
    },
    {
      id: 2,
      uuid: 'bed-uuid-2',
      bedNumber: 'BED-002',
      status: 'OCCUPIED' as const,
      row: 1,
      column: 2,
      location: { uuid: 'location-uuid-1', display: 'Ward A', name: 'Ward A' },
    },
  ],
  [
    {
      id: 3,
      uuid: 'bed-uuid-3',
      bedNumber: 'BED-003',
      status: 'AVAILABLE' as const,
      row: 2,
      column: 1,
      location: { uuid: 'location-uuid-2', display: 'Ward B', name: 'Ward B' },
    },
  ],
];

const defaultHookReturn = {
  bedsGroupedByLocation: mockBeds,
  isLoadingBedsGroupedByLocation: false,
  isValidatingBedsGroupedByLocation: false,
  mutateBedsGroupedByLocation: mockMutateBeds,
  errorFetchingBedsGroupedByLocation: null,
};

describe('BedAdministrationTable', () => {
  beforeEach(() => {
    mockUseBedsGroupedByLocation.mockReturnValue(defaultHookReturn);
  });

  it('renders table headers correctly', () => {
    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByRole('columnheader', { name: /bed id/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /location/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /occupancy status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /allocated/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
  });

  it('renders bed data in table rows', () => {
    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByRole('cell', { name: 'BED-001' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'BED-002' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'BED-003' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: /ward a/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('cell', { name: /ward b/i })).toBeInTheDocument();
  });

  it('renders loading skeleton when data is loading', () => {
    mockUseBedsGroupedByLocation.mockReturnValue({
      ...defaultHookReturn,
      bedsGroupedByLocation: [],
      isLoadingBedsGroupedByLocation: true,
    });

    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders error state when fetching beds fails', () => {
    mockUseBedsGroupedByLocation.mockReturnValue({
      ...defaultHookReturn,
      bedsGroupedByLocation: [],
      errorFetchingBedsGroupedByLocation: new Error('Failed to fetch beds'),
    });

    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no beds match the filter', async () => {
    const user = userEvent.setup();

    mockUseBedsGroupedByLocation.mockReturnValue({
      ...defaultHookReturn,
      bedsGroupedByLocation: [
        [
          {
            id: 1,
            uuid: 'bed-uuid-1',
            bedNumber: 'BED-001',
            status: 'AVAILABLE' as const,
            row: 1,
            column: 1,
            location: { uuid: 'location-uuid-1', display: 'Ward A', name: 'Ward A' },
          },
        ],
      ],
    });

    renderWithSwr(<BedAdministrationTable />);

    const dropdown = screen.getByRole('combobox', { name: /filter by occupancy status/i });
    await user.click(dropdown);
    await user.click(screen.getByRole('option', { name: /occupied/i }));

    expect(screen.getByText(/no data to display/i)).toBeInTheDocument();
  });

  it('filters beds by occupancy status', async () => {
    const user = userEvent.setup();

    renderWithSwr(<BedAdministrationTable />);

    const dropdown = screen.getByRole('combobox', { name: /filter by occupancy status/i });
    await user.click(dropdown);
    await user.click(screen.getByRole('option', { name: /occupied/i }));

    expect(screen.queryByRole('cell', { name: 'BED-001' })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'BED-002' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'BED-003' })).not.toBeInTheDocument();
  });

  it('launches add bed workspace when "Add bed" button is clicked', async () => {
    const user = userEvent.setup();

    renderWithSwr(<BedAdministrationTable />);

    const addBedButton = screen.getAllByRole('button', { name: /add bed/i })[0];
    await user.click(addBedButton);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'bed-form-workspace',
      expect.objectContaining({ mutateBeds: mockMutateBeds }),
    );
  });

  it('launches edit bed workspace with bed data when edit button is clicked', async () => {
    const user = userEvent.setup();

    renderWithSwr(<BedAdministrationTable />);

    const editButtons = screen.getAllByRole('button', { name: /edit bed/i });
    await user.click(editButtons[0]);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'bed-form-workspace',
      expect.objectContaining({
        bed: expect.objectContaining({ bedNumber: 'BED-001' }),
        mutateBeds: mockMutateBeds,
      }),
    );
  });

  it('shows inline loading indicator while revalidating', () => {
    mockUseBedsGroupedByLocation.mockReturnValue({
      ...defaultHookReturn,
      isValidatingBedsGroupedByLocation: true,
    });

    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByTitle(/loading/i)).toBeInTheDocument();
  });

  it('renders the page header with correct title', () => {
    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByRole('heading', { name: /bed allocation/i })).toBeInTheDocument();
  });

  //though only 3 beds are there in mock data so but Carbon's Pagination will be disabled,but it will still be present in the DOM test checks  toBeInTheDocument() so test passes
  it('renders pagination when beds are present', () => {
    renderWithSwr(<BedAdministrationTable />);

    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
  });
});
