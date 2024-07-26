/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { defineConfigSchema, getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import { mockPriorityNonUrgent, mockQueueEntries, mockSession } from '__mocks__';
import { renderWithSwr } from 'tools';
import QueueTable from './queue-table.component';
import { type ConfigObject, configSchema } from '../config-schema';

const mockUseSession = jest.mocked(useSession);
const mockUseConfig = jest.mocked(useConfig);
const configDefaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

const configWithCustomColumns = {
  queueTables: {
    columnDefinitions: [
      {
        id: 'emr-id',
        columnType: 'patient-identifier',
        config: {
          identifierType: '8d793bee-c2cc-11de-8d13-0010c6dffd0f',
        },
        header: 'EMR ID',
      },
      {
        id: 'in-service-time',
        columnType: 'wait-time',
        header: 'Time in service',
      },
      {
        id: 'check-in-date',
        columnType: 'visit-start-time',
        header: 'Check-in date',
      },
    ],
    tableDefinitions: [
      {
        columns: ['patient-name', 'emr-id', 'patient-age', 'check-in-date', 'wait-time', 'actions'],
        appliedTo: [
          {
            queue: 'triage-queue-uuid',
            status: 'waiting-status-uuid',
          },
        ],
      },
      {
        columns: ['patient-name', 'emr-id', 'patient-age', 'in-service-time', 'actions'],
        appliedTo: [
          {
            queue: 'triage-queue-uuid',
            status: 'in-service-status-uuid',
          },
        ],
      },
    ],
  },
};

describe('QueueTable', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseConfig.mockReturnValue(configDefaults);
  });

  it('renders an empty table with default columns when there are no queue entries', () => {
    renderWithSwr(<QueueTable queueEntries={[]} statusUuid={null} queueUuid={null} />);

    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(1); // should only have the header row

    const headerRow = rows[0];
    const expectedHeaders = [/name/i, /coming from/i, /priority/i, /status/i, /queue/i, /wait time/i, /actions/i];
    const headers = within(headerRow).getAllByRole('columnheader');
    for (let i = 0; i < headers.length; i++) {
      expect(headers[i]).toHaveTextContent(expectedHeaders[i]);
    }
  });

  it('renders queue entries with default columns', () => {
    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} statusUuid={null} queueUuid={null} />);

    for (const entry of mockQueueEntries) {
      const patientName = entry.patient.person.display;
      const row = screen.getByText(patientName).closest('tr');

      expect(within(row).getByText(entry.status.display)).toBeInTheDocument();
      expect(within(row).getByText(entry.priority.display)).toBeInTheDocument();
    }
  });

  it('allows modifying the columns of the table applied to all queues and statuses', () => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      queueTables: {
        ...configDefaults.queueTables,
        tableDefinitions: [
          {
            columns: ['patient-name', 'status', 'wait-time', 'actions'],
            appliedTo: [{ queue: null, status: null }],
          },
        ],
      },
    });

    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} statusUuid={'foo'} queueUuid={'bar'} />);

    const rows = screen.queryAllByRole('row');
    const headerRow = rows[0];
    const expectedHeaders = [/name/i, /status/i, /wait time/i, /actions/i];
    const headers = within(headerRow).getAllByRole('columnheader');
    for (let i = 0; i < headers.length; i++) {
      expect(headers[i]).toHaveTextContent(expectedHeaders[i]);
    }
  });

  it('will use the correct default table even when not provided explicitly in the config', () => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      ...configWithCustomColumns,
    });

    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} statusUuid={'foo'} queueUuid={'bar'} />);

    const rows = screen.queryAllByRole('row');
    const headerRow = rows[0];
    const expectedHeaders = [/name/i, /coming from/i, /priority/i, /status/i, /queue/i, /wait time/i, /actions/i];
    const headers = within(headerRow).getAllByRole('columnheader');
    for (let i = 0; i < headers.length; i++) {
      expect(headers[i]).toHaveTextContent(expectedHeaders[i]);
    }
  });

  it('allows modifying the columns of tables by queue and status, including with custom column definitions', () => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      ...configWithCustomColumns,
    });

    renderWithSwr(
      <QueueTable
        queueEntries={mockQueueEntries}
        statusUuid={'in-service-status-uuid'}
        queueUuid={'triage-queue-uuid'}
      />,
    );

    const rows = screen.queryAllByRole('row');
    const headerRow = rows[0];
    const expectedHeaders = [/name/i, /EMR ID/i, /age/i, /time in service/i, /actions/i];
    const headers = within(headerRow).getAllByRole('columnheader');
    for (let i = 0; i < headers.length; i++) {
      expect(headers[i]).toHaveTextContent(expectedHeaders[i]);
    }
  });

  it('supports custom styles for priority tags at column level', () => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      queueTables: {
        columnDefinitions: [
          {
            id: 'priority',
            config: {
              priorityConfigs: [
                {
                  conceptUuid: mockPriorityNonUrgent.uuid,
                  color: 'blue',
                  style: 'bold',
                },
              ],
            },
          },
        ],
        tableDefinitions: [
          {
            columns: ['patient-name', 'priority'],
          },
        ],
      },
    });

    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} statusUuid={null} queueUuid={'triage-queue-uuid'} />);

    const rows = screen.queryAllByRole('row');
    const firstRow = rows[1];
    const cells = within(firstRow).getAllByRole('cell');
    expect(cells[1].childNodes[0]).toHaveClass('bold');
  });

  it('uses the visitQueueNumberAttributeUuid defined at the top level', () => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      visitQueueNumberAttributeUuid: 'queue-number-visit-attr-uuid',
      queueTables: {
        ...configDefaults.queueTables,
        tableDefinitions: [
          {
            columns: ['patient-name', 'queue-number'],
          },
        ],
      },
    });

    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} statusUuid={null} queueUuid={'triage-queue-uuid'} />);

    const rows = screen.queryAllByRole('row');
    const aliceRow = rows[2];
    const cells = within(aliceRow).getAllByRole('cell');
    expect(cells[1].childNodes[0]).toHaveTextContent('42');
  });
});
