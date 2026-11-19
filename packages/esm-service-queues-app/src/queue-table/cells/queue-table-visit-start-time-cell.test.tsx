import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { mockQueueEntryAlice } from '__mocks__';
import { type QueueEntry } from '../../types';
import { queueTableVisitStartTimeColumn } from './queue-table-visit-start-time-cell.component';

const { CellComponent, getFilterableValue } = queueTableVisitStartTimeColumn('visit-start-time', 'Visit start time');

describe('queueTableVisitStartTimeColumn', () => {
  it('shows the visit start time', () => {
    const queueEntry = {
      ...mockQueueEntryAlice,
      visit: { ...mockQueueEntryAlice.visit, startDatetime: '2024-01-04T09:30:00.000+0000' },
    } as QueueEntry;

    const { container } = render(<CellComponent queueEntry={queueEntry} />);

    expect(container).toHaveTextContent(/2024/);
    expect(getFilterableValue(queueEntry)).toMatch(/2024/);
  });

  it('shows a placeholder instead of "Invalid Date" when the queue entry has no visit', () => {
    const queueEntry = { ...mockQueueEntryAlice, visit: null } as QueueEntry;

    const { container } = render(<CellComponent queueEntry={queueEntry} />);

    expect(container).not.toHaveTextContent(/invalid/i);
    expect(container).toHaveTextContent('--');
    expect(getFilterableValue(queueEntry)).toBeNull();
  });
});
