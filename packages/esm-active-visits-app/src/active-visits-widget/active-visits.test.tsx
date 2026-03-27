import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { getDefaultsFromConfigSchema, type OpenmrsResource, navigate, useConfig } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { type ActiveVisitsConfigSchema, configSchema } from '../config-schema';
import { type ActiveVisit, type Observation } from '../types';
import { useActiveVisits, useObsConcepts } from './active-visits.resource';
import ActiveVisitsTable from './active-visits.component';

const mockUseActiveVisits = jest.mocked(useActiveVisits);
const mockUseObsConcepts = jest.mocked(useObsConcepts);
const mockUseConfig = jest.mocked(useConfig<ActiveVisitsConfigSchema>);

jest.mock('./active-visits.resource', () => ({
  ...jest.requireActual('./active-visits.resource'),
  useActiveVisits: jest.fn(),
  useObsConcepts: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  navigate: jest.fn(),
}));

const mockObsConcepts: Array<OpenmrsResource> = [
  { uuid: '160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Sickle cell screening test' },
  { uuid: '5484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Nutritional support' },
];

const mockConfig: ActiveVisitsConfigSchema = {
  activeVisits: {
    ...getDefaultsFromConfigSchema<ActiveVisitsConfigSchema>(configSchema).activeVisits,
    obs: ['160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '5484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    identifiers: [],
  },
};

const mockActiveVisits: ActiveVisit[] = [
  {
    age: '20',
    gender: 'male',
    id: '1',
    idNumber: '000001A',
    location: mockSession.data.sessionLocation.uuid,
    name: 'John Doe',
    patientUuid: 'uuid1',
    visitStartTime: '',
    visitType: 'Checkup',
    visitUuid: 'visit-uuid-1',
  },
  {
    age: '25',
    gender: 'female',
    id: '2',
    idNumber: '000001B',
    location: mockSession.data.sessionLocation.uuid,
    name: 'Some One',
    patientUuid: 'uuid2',
    visitStartTime: '',
    visitType: 'Checkup',
    visitUuid: 'visit-uuid-2',
  },
];

const mockNavigate = jest.mocked(navigate);

describe('ActiveVisitsTable', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseConfig.mockReturnValue(mockConfig);
    mockUseObsConcepts.mockReturnValue({
      obsConcepts: mockObsConcepts,
      isLoadingObsConcepts: false,
    });
    mockUseActiveVisits.mockReturnValue({
      activeVisits: mockActiveVisits,
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 1,
    });
  });

  it('renders data table with standard and observation columns', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: mockActiveVisits.map((visit) => ({
        ...visit,
        observations: {
          '160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': [
            {
              value: { uuid: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Patient is sick' },
              uuid: 'obs-uuid-1',
            } as unknown as Observation,
          ],
          '5484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': [
            {
              value: 'Not done',
              uuid: 'obs-uuid-2',
            } as unknown as Observation,
          ],
        },
      })),
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 0,
    });

    render(<ActiveVisitsTable />);

    const standardColumnHeaders = [/Visit Time/, /Name/, /Gender/, /Age/, /Visit Type/, /Billing/];
    standardColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    expect(screen.getByRole('columnheader', { name: /Sickle cell screening test/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Nutritional support/ })).toBeInTheDocument();
  });

  it('displays observation values correctly', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: mockActiveVisits.map((visit) => ({
        ...visit,
        observations: {
          '160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': [
            {
              value: { uuid: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Patient is sick' },
              uuid: 'obs-uuid-1',
            } as unknown as Observation,
          ],
          '5484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': [
            {
              value: 'Not done',
              uuid: 'obs-uuid-2',
            } as unknown as Observation,
          ],
        },
      })),
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 0,
    });

    render(<ActiveVisitsTable />);

    expect(screen.getAllByRole('cell', { name: /Patient is sick/ }).length).toBe(2);
    expect(screen.getAllByRole('cell', { name: /Not done/ }).length).toBe(2);
  });

  it('filters active visits based on search input', async () => {
    const user = userEvent.setup();

    mockUseActiveVisits.mockReturnValue({
      activeVisits: mockActiveVisits,
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 2,
    });

    render(<ActiveVisitsTable />);

    const searchInput = screen.getByPlaceholderText('Filter table');
    await user.type(searchInput, 'John');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Some One')).not.toBeInTheDocument();
  });

  it('renders billing status as a ghost button when a bill is matched', async () => {
    const user = userEvent.setup();
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [
        {
          ...mockActiveVisits[0],
          billingStatus: 'Pending',
          billUuid: 'bill-uuid-1',
        },
        {
          ...mockActiveVisits[1],
          billingStatus: '',
          billUuid: undefined,
        },
      ],
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 2,
    });

    render(<ActiveVisitsTable />);

    const billingButton = screen.getByRole('button', { name: /pending/i });
    expect(billingButton).toHaveTextContent('Pending');

    await user.click(billingButton);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '${openmrsSpaBase}/home/billing/patient/${patientUuid}/${billUuid}',
      templateParams: { patientUuid: 'uuid1', billUuid: 'bill-uuid-1' },
    });
  });

  it('renders an empty billing cell when no bill is matched', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [
        {
          ...mockActiveVisits[0],
          billingStatus: 'Pending',
          billUuid: 'bill-uuid-1',
        },
        {
          ...mockActiveVisits[1],
          billingStatus: '',
          billUuid: undefined,
        },
      ],
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 2,
    });

    render(<ActiveVisitsTable />);

    const secondRow = screen.getByTestId('activeVisitRowuuid2');
    expect(within(secondRow).queryByRole('button', { name: /pending|paid/i })).not.toBeInTheDocument();
  });

  it('displays empty state when there are no active visits', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [],
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 0,
    });

    render(<ActiveVisitsTable />);

    expect(screen.getByText('There are no active visits to display for this location.')).toBeInTheDocument();
  });

  it('should not display the table when the data is loading', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [],
      isLoading: true,
      isValidating: false,
      error: undefined,
      totalResults: 0,
    });

    render(<ActiveVisitsTable />);

    const expectedColumnHeaders = [/Visit Time/, /ID Number/, /Name/, /Gender/, /Age/, /Visit Type/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.queryByRole('columnheader', { name: new RegExp(header, 'i') })).not.toBeInTheDocument();
    });
  });

  it('should display the error state when there is error', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [],
      isLoading: false,
      isValidating: false,
      error: new Error('Error fetching data'),
      totalResults: 0,
    });

    render(<ActiveVisitsTable />);

    expect(screen.getByText(/Error State/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should display the pagination when pagination is true', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: mockActiveVisits,
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 2,
    });

    render(<ActiveVisitsTable />);
  });
});
