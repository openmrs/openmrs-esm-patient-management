import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { formatDatetime } from '@openmrs/esm-framework';
import { mockQueueEntryAlice } from '__mocks__';
import { type QueueEntry } from '../../types';
import { queueTableVisitStartTimeColumn } from './queue-table-visit-start-time-cell.component';

const { CellComponent, getFilterableValue } = queueTableVisitStartTimeColumn('visit-start-time', 'Visit start time');

describe('queueTableVisitStartTimeColumn', () => {
  it('shows the visit start time', () => {
    const startDatetime = '2024-01-04T09:30:00.000+0000';
    const queueEntry = {
      ...mockQueueEntryAlice,
      visit: { ...mockQueueEntryAlice.visit, startDatetime },
    } as QueueEntry;
    const expected = formatDatetime(new Date(startDatetime));

    const { container } = render(<CellComponent queueEntry={queueEntry} />);

    expect(container).toHaveTextContent(expected);
    expect(getFilterableValue(queueEntry)).toBe(expected);
  });

  it('shows -- instead of throwing when the queue entry has no visit', () => {
    const queueEntry = { ...mockQueueEntryAlice, visit: null } as QueueEntry;

    const { container } = render(<CellComponent queueEntry={queueEntry} />);

    expect(container).toHaveTextContent('--');
    expect(getFilterableValue(queueEntry)).toBeNull();
  });
});
