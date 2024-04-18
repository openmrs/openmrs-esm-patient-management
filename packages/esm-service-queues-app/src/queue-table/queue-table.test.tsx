import React from 'react';
import { defineConfigSchema, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import { mockQueueEntries, mockSession } from '__mocks__';
import { renderWithSwr } from 'tools';
import { defaultQueueTableConfig } from './queue-table-by-status.component';
import QueueTable from './queue-table.component';
import { configSchema } from '../config-schema';

const mockUseSession = useSession as jest.Mock;

describe('QueueTable: ', () => {
  beforeAll(() => {
    defineConfigSchema('@openmrs/esm-service-queues-app', configSchema);
  });

  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession);
  });

  it('renders an empty table with default columns when there are no queue entries', () => {
    renderWithSwr(<QueueTable queueEntries={[]} queueTableColumns={defaultQueueTableConfig.columns} />);

    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(1); // should only have the header row

    const headerRow = rows[0];
    const expectedColumnHeaders = ['Name', 'Priority', 'Coming from', 'Status', 'Wait time', 'Actions'];
    for (const expectedHeader of expectedColumnHeaders) {
      expect(within(headerRow).getByText(expectedHeader)).toBeInTheDocument();
    }
  });

  it('renders queue entries with default columns', () => {
    renderWithSwr(<QueueTable queueEntries={mockQueueEntries} queueTableColumns={defaultQueueTableConfig.columns} />);

    for (const entry of mockQueueEntries) {
      const patientName = entry.patient.display;
      const row = screen.getByText(patientName).closest('tr');

      expect(within(row).getByText(entry.status.display)).toBeInTheDocument();
      expect(within(row).getByText(entry.priority.display)).toBeInTheDocument();

      // has either a "Undo transition" or "Delete" link, depending on whether it has a previous queue entry or not
      if (entry.previousQueueEntry == null) {
        expect(within(row).getByText('Delete')).toBeInTheDocument();
      } else {
        expect(within(row).getByText('Undo transition')).toBeInTheDocument();
      }
    }
  });
});
