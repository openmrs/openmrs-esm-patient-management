import React from 'react';
import { defineConfigSchema, getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import { mockQueueEntries, mockSession } from '__mocks__';
import { renderWithSwr } from 'tools';
import QueueTable from './queue-table.component';
import { configSchema, defaultTablesConfig } from '../config-schema';

const mockUseSession = useSession as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;

mockedUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
  customPatientChartUrl: 'someUrl',
  // TODO: remove after O3-3139 is fixed
  tablesConfig: {
    columnDefinitions: [
      {
        id: 'patient-name',
        columnType: 'patient-name-column',
      },
      {
        id: 'priority',
        columnType: 'priority-column',
        config: {
          priorities: [
            {
              conceptUuid: 'priority-concept-uuid',
              tagClassName: 'tag',
              tagType: 'red',
            },
          ],
        },
      },
      {
        id: 'status',
        columnType: 'status-column',
        config: {
          statuses: [
            {
              conceptUuid: 'status-concept-uuid',
              iconComponent: 'InProgress',
            },
          ],
        },
      },
      {
        id: 'comingFrom',
        columnType: 'queue-coming-from-column',
      },
      {
        id: 'queue',
        columnType: 'current-queue-column',
      },
      {
        id: 'wait-time',
        columnType: 'wait-time-column',
      },
    ],
    tableDefinitions: [
      {
        columns: ['patient-name', 'comingFrom', 'priority', 'status', 'queue', 'wait-time'],
        appliedTo: [{ queue: null, status: null }],
      },
    ],
  },
});

describe('QueueTable: ', () => {
  beforeAll(() => {
    defineConfigSchema('@openmrs/esm-service-queues-app', configSchema);
  });

  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession);
  });

  it('renders an empty table with default columns when there are no queue entries', () => {
    renderWithSwr(<QueueTable queueEntries={[]} statusUuid={null} queueUuid={null} />);

    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(1); // should only have the header row

    const headerRow = rows[0];
    const expectedColumnHeaders = [/name/i, /priority/i, /coming from/i, /status/i, /wait time/i];
    for (const expectedHeader of expectedColumnHeaders) {
      expect(within(headerRow).getByText(expectedHeader)).toBeInTheDocument();
    }
  });

  it('renders queue entries with default columns', () => {
    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} statusUuid={null} queueUuid={null} />);

    for (const entry of mockQueueEntries) {
      const patientName = entry.patient.display;
      const row = screen.getByText(patientName).closest('tr');

      expect(within(row).getByText(entry.status.display)).toBeInTheDocument();
      expect(within(row).getByText(entry.priority.display)).toBeInTheDocument();
    }
  });
});
