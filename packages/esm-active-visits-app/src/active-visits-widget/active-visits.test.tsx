import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockPatient, mockSession } from '__mocks__';
import { configSchema, type SectionDefinition } from '../config-schema';
import { useActiveVisits } from './active-visits.resource';
import ActiveVisitsTable from './active-visits.component';

const mockUseActiveVisits = jest.mocked(useActiveVisits);
const mockUseConfig = jest.mocked(useConfig<SectionDefinition>);

jest.mock('./active-visits.resource', () => ({
  ...jest.requireActual('./active-visits.resource'),
  useActiveVisits: jest.fn(),
}));

describe('ActiveVisitsTable', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });

    mockUseActiveVisits.mockReturnValue({
      activeVisits: [
        {
          age: '20',
          gender: 'male',
          id: '1',
          idNumber: mockPatient.uuid,
          location: mockSession.data.sessionLocation.uuid,
          name: 'John Doe',
          patientUuid: 'uuid1',
          visitStartTime: '',
          visitType: 'Checkup',
          visitUuid: 'visit-uuid-1',
        },
      ],
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 1,
    });
  });

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

  it('filters active visits based on search input', async () => {
    const user = userEvent.setup();

    mockUseActiveVisits.mockReturnValue({
      activeVisits: [
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
      ],
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
      activeVisits: [
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
      ],
      isLoading: false,
      isValidating: false,
      error: undefined,
      totalResults: 2,
    });

    render(<ActiveVisitsTable />);
  });
});
