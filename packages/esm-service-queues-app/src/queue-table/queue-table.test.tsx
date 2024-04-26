import React from 'react';
import { defineConfigSchema, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import { mockQueueEntries, mockSession } from '__mocks__';
import { renderWithSwr } from 'tools';
import QueueTable from './queue-table.component';
import { configSchema, defaultTablesConfig } from '../config-schema';
import { useColumns } from './cells/columns.resource';

const mockUseSession = useSession as jest.Mock;

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
    const expectedColumnHeaders = [/name/i, /priority/i, /coming from/i, /status/i, /wait time/i, /actions/i];
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
