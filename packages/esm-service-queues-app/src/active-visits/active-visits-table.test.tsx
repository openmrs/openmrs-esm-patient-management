import React from 'react';
import { of } from 'rxjs';
import { screen } from '@testing-library/react';
import { type ConfigObject, useConfig, usePagination, useSession } from '@openmrs/esm-framework';
import { mockServices, mockVisitQueueEntries, mockMappedQueueEntries, mockSession } from '__mocks__';
import { renderWithSwr } from 'tools';
import { useVisitQueueEntries } from './active-visits-table.resource';
import { useQueueRooms } from '../add-provider-queue-room/add-provider-queue-room.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import ActiveVisitsTable from './active-visits-table.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockGoToPage = jest.fn();
const mockUseVisitQueueEntries = useVisitQueueEntries as jest.Mock;
const mockQueueLocations = useQueueLocations as jest.Mock;
const mockUseQueueRooms = useQueueRooms as jest.Mock;
const mockUseSession = useSession as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});

jest.mock('./active-visits-table.resource', () => {
  const originalModule = jest.requireActual('./active-visits-table.resource');

  return {
    ...originalModule,
    useServices: jest.fn().mockReturnValue({ services: mockServices }),
    useVisitQueueEntries: jest.fn(),
  };
});

jest.mock('../patient-search/hooks/useQueueLocations', () => {
  const originalModule = jest.requireActual('../patient-search/hooks/useQueueLocations');

  return {
    ...originalModule,
    useQueueLocations: jest.fn(),
  };
});

jest.mock('../add-provider-queue-room/add-provider-queue-room.resource', () => {
  const originalModule = jest.requireActual('../add-provider-queue-room/add-provider-queue-room.resource');

  return {
    ...originalModule,
    useQueueRooms: jest.fn(),
  };
});

jest.mock('../helpers/helpers', () => {
  const originalModule = jest.requireActual('../helpers/helpers');

  return {
    ...originalModule,
    getSelectedServiceName: jest.fn().mockReturnValue(of({ serviceName: 'All' })),
  };
});

jest.setTimeout(20000);

describe('ActiveVisitsTable: ', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession),
      mockedUseConfig.mockReturnValue({
        concepts: {
          priorityConceptSetUuid: '96105db1-abbf-48d2-8a52-a1d561fd8c90',
          serviceConceptSetUuid: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
        },
        visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
        showQueueTableTab: false,
      } as ConfigObject);
  });

  it('renders an empty state view if data is unavailable', async () => {
    mockQueueLocations.mockReturnValueOnce({ queueLocations: [] });
    mockUseQueueRooms.mockReturnValue({ rooms: [] });
    mockUseVisitQueueEntries.mockReturnValueOnce({ visitQueueEntries: [], isLoading: false });

    renderActiveVisitsTable();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
    expect(screen.getByText(/no patients to display/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of visit queue entry data when available', async () => {
    mockQueueLocations.mockReturnValueOnce({ queueLocations: mockQueueLocations });
    mockUseQueueRooms.mockReturnValue({ rooms: mockUseQueueRooms });
    mockUseVisitQueueEntries.mockReturnValue({ visitQueueEntries: mockVisitQueueEntries, isLoading: false });
    mockUsePagination.mockReturnValue({
      results: mockMappedQueueEntries.data.slice(0, 2),
      goTo: mockGoToPage,
      currentPage: 1,
    });

    renderActiveVisitsTable();

    await screen.findByRole('table');

    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
    expect(screen.queryByText(/no patients to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /eric test ric/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john smith/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /priority/, /status/, /wait time/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /Eric Test Ric Not Urgent Waiting - Triage 206 hours and 2 minutes/,
      /John Smith Emergency In Service - Clinical consultation 206 hours and 2 minutes/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });
  });
});

function renderActiveVisitsTable() {
  renderWithSwr(<ActiveVisitsTable />);
}
