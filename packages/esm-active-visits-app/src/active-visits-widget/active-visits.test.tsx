import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, type OpenmrsResource, useConfig } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { type ActiveVisitsConfigSchema, configSchema } from '../config-schema';
import { useActiveVisits, useObsConcepts } from './active-visits.resource';
import ActiveVisitsTable from './active-visits.component';
import { type ActiveVisit, type Observation } from '../types';

const mockUseActiveVisits = jest.mocked(useActiveVisits);
const mockUseObsConcepts = jest.mocked(useObsConcepts);
const mockIsDesktop = jest.mocked(useObsConcepts);
const mockUseConfig = jest.mocked(useConfig<ActiveVisitsConfigSchema>);

jest.mock('./active-visits.resource', () => ({
  ...jest.requireActual('./active-visits.resource'),
  useActiveVisits: jest.fn(),
  useObsConcepts: jest.fn(),
}));

const mockObsConcepts: Array<OpenmrsResource> = [
  { uuid: '160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Sickle cell screening test' },
  { uuid: '5484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Nutritional support' },
];

const mockConfig: ActiveVisitsConfigSchema = {
  activeVisits: {
    ...getDefaultsFromConfigSchema(configSchema).activeVisits,
    obs: ['160225AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '5484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
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

describe('ActiveVisitsTable', () => {
  beforeEach(() => {
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

  afterEach(() => {
    jest.clearAllMocks();
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

    const standardColumnHeaders = [/Visit Time/, /ID Number/, /Name/, /Gender/, /Age/, /Visit Type/];
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
