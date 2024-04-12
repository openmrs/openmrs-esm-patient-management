import React from 'react';
import { of } from 'rxjs';
import { screen } from '@testing-library/react';
import { type ConfigObject, useConfig, useSession } from '@openmrs/esm-framework';
import { mockServices, mockSession, mockQueueEntries } from '__mocks__';
import { renderWithSwr } from 'tools';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { useQueueRooms } from '../add-provider-queue-room/add-provider-queue-room.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import DefaultQueueTable from '../queue-table/default-queue-table.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockUseQueueEntries = useQueueEntries as jest.Mock;
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

jest.mock('../hooks/useQueueEntries', () => {
  const originalModule = jest.requireActual('../hooks/useQueueEntries');

  return {
    ...originalModule,
    useQueueEntries: jest.fn(),
  };
});

jest.mock('../helpers/helpers', () => {
  const originalModule = jest.requireActual('../helpers/helpers');

  return {
    ...originalModule,
    getSelectedServiceName: jest.fn().mockReturnValue(of({ serviceName: 'All' })),
  };
});

describe('DefaultQueueTable: ', () => {
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
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: false });

    renderActiveVisitsTable();

    await screen.findByRole('table');

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
    expect(screen.getByText(/no patients to display/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of visit queue entry data when available', async () => {
    mockQueueLocations.mockReturnValue({ queueLocations: mockQueueLocations });
    mockUseQueueRooms.mockReturnValue({ rooms: mockUseQueueRooms });
    mockUseQueueEntries.mockReturnValue({ queueEntries: mockQueueEntries, isLoading: false });

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
      expect(
        screen.getByRole('columnheader', {
          name: new RegExp(header, 'i'),
        }),
      ).toBeInTheDocument();
    });
  });
});

function renderActiveVisitsTable() {
  renderWithSwr(<DefaultQueueTable />);
}
