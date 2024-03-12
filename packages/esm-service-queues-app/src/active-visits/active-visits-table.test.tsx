import React from 'react';
import { of } from 'rxjs';
import { screen } from '@testing-library/react';
import { type ConfigObject, useConfig, usePagination, useSession } from '@openmrs/esm-framework';
import { mockServices, mockVisitQueueEntries, mockSession, mockQueueEntries } from '__mocks__';
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
    useVisitQueueEntries: jest.fn(),
  };
});

jest.mock('../helpers/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({ queues: mockServices }),
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

describe('ActiveVisitsTable: ', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession),
      mockedUseConfig.mockReturnValue({
        concepts: {},
        visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
        showQueueTableTab: false,
        customPatientChartUrl: 'someUrl',
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
      results: mockQueueEntries,
      goTo: mockGoToPage,
      currentPage: 1,
    });

    renderActiveVisitsTable();

    await screen.findByRole('table');

    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
    expect(screen.queryByText(/no patients to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Brian Johnson/i })).toBeInTheDocument();
    const john = screen.getByRole('link', { name: /Alice Johnson/i });
    expect(john).toBeInTheDocument();
    expect(john).toHaveAttribute('href', 'someUrl');

    const expectedColumnHeaders = [/name/, /priority/, /status/, /waitTime/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });
});

function renderActiveVisitsTable() {
  renderWithSwr(<ActiveVisitsTable />);
}
