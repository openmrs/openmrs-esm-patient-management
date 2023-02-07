import React from 'react';
import { screen } from '@testing-library/react';
import { ConfigObject, openmrsFetch, useConfig, usePagination } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockServices, mockVisitQueueEntries } from '../../__mocks__/active-visits.mock';
import ActiveVisitsTable from './active-visits-table.component';
import { mockQueueLocations } from '../../../../__mocks__/locations.mock';
import { mockMappedQueueEntries } from '../../../../__mocks__/queue-entry.mock';
import { useVisitQueueEntries } from './active-visits-table.resource';

const mockedUseConfig = useConfig as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockGoToPage = jest.fn();
const mockUseVisitQueueEntries = useVisitQueueEntries as jest.Mock;

jest.mock('./active-visits-table.resource', () => {
  const originalModule = jest.requireActual('./active-visits-table.resource');

  return {
    ...originalModule,
    useServices: jest.fn().mockReturnValue({ services: mockServices }),
    useVisitQueueEntries: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});

jest.setTimeout(20000);

describe('ActiveVisitsTable: ', () => {
  beforeEach(() =>
    mockedUseConfig.mockReturnValue({
      concepts: {
        priorityConceptSetUuid: '96105db1-abbf-48d2-8a52-a1d561fd8c90',
        serviceConceptSetUuid: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
      },
      showQueueTableTab: false,
    } as ConfigObject),
  );

  it('renders an empty state view if data is unavailable', async () => {
    mockUseVisitQueueEntries.mockReturnValueOnce({ visitQueueEntries: [], isLoading: false });

    renderActiveVisitsTable();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
    expect(screen.getByText(/no patients to display/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of visit queue entry data when available', async () => {
    mockUseVisitQueueEntries.mockReturnValueOnce({ visitQueueEntries: mockVisitQueueEntries, isLoading: false });
    mockUsePagination.mockReturnValue({
      results: mockMappedQueueEntries.data.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
    });

    renderActiveVisitsTable();

    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
    expect(screen.queryByText(/no patients to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /eric test ric/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john smith/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /priority/, /status/, /wait time/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /Eric Test Ric Not Urgent Waiting For Triage 206 hours and 2 minutes/,
      /John Smith Emergency Attending Clinical Consultation 206 hours and 2 minutes/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });
  });
});

function renderActiveVisitsTable() {
  renderWithSwr(<ActiveVisitsTable />);
}
