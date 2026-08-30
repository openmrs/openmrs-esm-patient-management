import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { type Queue } from '../types';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';

vi.mock('../queue-table/queue-table-metrics.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="queue-metrics" />),
}));

vi.mock('../attending-patients/attending-patients.component', () => ({
  __esModule: true,
  default: vi.fn(({ queueUuid }) => <div data-testid="attending-patients">attending:{queueUuid}</div>),
}));

vi.mock('../queue-table/default-queue-table.component', () => ({
  __esModule: true,
  default: vi.fn(({ queueUuid, status }) => (
    <div data-testid="status-table">
      {status.display}:{queueUuid}
    </div>
  )),
}));

const config = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
const inServiceUuid = config.concepts.defaultTransitionStatus;

// The backend returns allowed statuses in reverse workflow order, which the view flips back.
const queue = {
  uuid: 'q1',
  display: 'Outpatient Triage',
  allowedStatuses: [
    { uuid: 'finished-uuid', display: 'Finished service' },
    { uuid: inServiceUuid, display: 'In Service' },
    { uuid: 'waiting-uuid', display: 'Waiting' },
  ],
} as unknown as Queue;

describe('QueueTablesForAllStatuses', () => {
  beforeEach(() => {
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(config);
  });

  it('gives every status except in-service a table, in workflow order', () => {
    render(<QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={false} errorFetchingQueue={null} />);

    const tables = screen.getAllByTestId('status-table');
    expect(tables.map((table) => table.textContent)).toEqual(['Waiting:q1', 'Finished service:q1']);
  });

  it('shows in-service patients as cards rather than a table', () => {
    render(<QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={false} errorFetchingQueue={null} />);

    expect(screen.getByTestId('attending-patients')).toHaveTextContent('attending:q1');
    expect(screen.queryByText(/^In Service:/)).not.toBeInTheDocument();
  });

  it('names the queue in the header and shows its metrics', () => {
    render(<QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={false} errorFetchingQueue={null} />);

    expect(screen.getByText('Outpatient Triage')).toBeInTheDocument();
    expect(screen.getByTestId('queue-metrics')).toBeInTheDocument();
  });

  it('asks for a status to be configured when the queue allows none', () => {
    render(
      <QueueTablesForAllStatuses
        selectedQueue={{ ...queue, allowedStatuses: [] } as unknown as Queue}
        isLoadingQueue={false}
        errorFetchingQueue={null}
      />,
    );

    expect(screen.getByText(/no status configured/i)).toBeInTheDocument();
    expect(screen.queryByTestId('status-table')).not.toBeInTheDocument();
  });

  it('reports an unusable queue instead of rendering empty tables', () => {
    render(
      <QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={false} errorFetchingQueue={new Error('boom')} />,
    );

    expect(screen.getByText(/invalid queue/i)).toBeInTheDocument();
    expect(screen.queryByTestId('status-table')).not.toBeInTheDocument();
  });
});
