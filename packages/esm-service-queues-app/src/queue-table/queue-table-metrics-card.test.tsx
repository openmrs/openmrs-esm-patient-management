import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueueEntriesMetrics } from '../hooks/useQueueEntries';
import QueueTableMetricsCard, { QueueMetricTile } from './queue-table-metrics-card.component';

vi.mock('../hooks/useQueueEntries');

const mockUseQueueEntriesMetrics = vi.mocked(useQueueEntriesMetrics);

describe('QueueTableMetricsCard', () => {
  beforeEach(() => {
    mockUseQueueEntriesMetrics.mockReturnValue({ count: 12, averageWaitTime: 5 } as ReturnType<
      typeof useQueueEntriesMetrics
    >);
  });

  it('counts the given queue and status for itself', () => {
    render(<QueueTableMetricsCard headerLabel="Waiting" queueUuid="q1" status="s1" />);

    expect(mockUseQueueEntriesMetrics).toHaveBeenCalledWith({ queue: 'q1', status: 's1', isEnded: false });
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

describe('QueueMetricTile', () => {
  // Keeping the tile free of the hook is what stops a caller that already holds the figure firing an
  // unfiltered clinic-wide request it would throw away.
  it('renders a supplied figure without fetching anything', () => {
    render(<QueueMetricTile headerLabel="Waiting" value={0} />);

    expect(mockUseQueueEntriesMetrics).not.toHaveBeenCalled();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders a preformatted string value, such as a duration', () => {
    render(<QueueMetricTile headerLabel="Average wait" value="7 hours, 19 minutes" />);

    expect(screen.getByText('7 hours, 19 minutes')).toBeInTheDocument();
  });
});
