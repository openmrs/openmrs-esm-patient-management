import React from 'react';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { useClinicQueueMetrics, type QueueRollup } from '../hooks/useClinicQueueMetrics';
import { useServiceQueuesStore } from '../store/store';
import { type Queue } from '../types';
import ClinicOverview from './clinic-overview.component';

vi.mock('../hooks/useClinicQueueMetrics');

vi.mock('../store/store', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  useServiceQueuesStore: vi.fn(),
}));

const mockUseClinicQueueMetrics = vi.mocked(useClinicQueueMetrics);
const mockUseServiceQueuesStore = vi.mocked(useServiceQueuesStore);

function queue(uuid: string, display: string, location: string, service: string): Queue {
  return { uuid, display, name: display, location: { display: location }, service: { display: service } } as Queue;
}

function rollup(
  queue: Queue,
  waiting: number,
  attending: number,
  longestWaitMinutes: number | null,
  patient = '',
): QueueRollup {
  return {
    queue,
    waiting,
    attending,
    averageWaitMinutes: longestWaitMinutes,
    longestWait:
      longestWaitMinutes === null ? null : { minutes: longestWaitMinutes, startedAt: new Date(), patientName: patient },
  };
}

const rollups = [
  rollup(queue('q1', 'Triage', 'Outpatient clinic', 'Triage'), 12, 3, 38, 'Esther Nabwire'),
  rollup(queue('q2', 'Clinician review', 'Outpatient clinic', 'Clinical consultation'), 8, 2, 108, 'Achieng Otieno'),
  rollup(queue('q3', 'Antenatal', 'MCH clinic', 'Antenatal care'), 0, 0, null),
];

type ClinicQueueMetrics = ReturnType<typeof useClinicQueueMetrics>;

function givenMetrics(overrides: Partial<ClinicQueueMetrics> = {}) {
  // Annotated rather than cast, so a field the hook does not actually return is flagged.
  const metrics: ClinicQueueMetrics = {
    rollups,
    totals: {
      waiting: 20,
      attending: 5,
      averageWaitMinutes: 26,
      longestWait: { minutes: 108, startedAt: new Date(), patientName: 'Achieng Otieno' },
    },
    isLoading: false,
    error: undefined,
  };

  mockUseClinicQueueMetrics.mockReturnValue({ ...metrics, ...overrides });
}

function givenSelectedLocation(uuid: string | null, name: string | null = null, serviceUuid: string | null = null) {
  mockUseServiceQueuesStore.mockReturnValue({
    selectedQueueLocationUuid: uuid,
    selectedQueueLocationName: name,
    selectedServiceUuid: serviceUuid,
  } as ReturnType<typeof useServiceQueuesStore>);
}

// The queue name is the first cell of every body row.
function queueNamesInOrder() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);
}

describe('ClinicOverview', () => {
  beforeEach(() => {
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(getDefaultsFromConfigSchema<ConfigObject>(configSchema));
    givenSelectedLocation(null);
    givenMetrics();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a row per queue and the clinic totals', () => {
    render(<ClinicOverview />);

    const review = screen.getByRole('row', { name: /clinician review/i });
    expect(within(review).getByText('8')).toBeInTheDocument();
    expect(within(review).getByText('Achieng Otieno')).toBeInTheDocument();

    const metrics = screen.getByTestId('clinic-administrator-metrics');
    expect(within(metrics).getByText('20')).toBeInTheDocument();
    expect(within(metrics).getByText('26 minutes')).toBeInTheDocument();
  });

  // A card frozen at fetch time drifts away from the row it summarises, which keeps counting.
  it('keeps the longest-wait card counting alongside the column it summarises', () => {
    vi.useFakeTimers();
    const startedAt = new Date(Date.now() - 40 * 60_000);
    givenMetrics({
      totals: {
        waiting: 20,
        attending: 5,
        averageWaitMinutes: 26,
        longestWait: { minutes: 40, startedAt, patientName: 'Achieng Otieno' },
      },
    });

    render(<ClinicOverview />);
    const metrics = screen.getByTestId('clinic-administrator-metrics');
    expect(within(metrics).getByText('40 minutes')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(within(metrics).getByText('41 minutes')).toBeInTheDocument();
  });

  it('makes the queue name itself the link into the queue', () => {
    render(<ClinicOverview />);

    expect(screen.getByRole('link', { name: 'Clinician review' })).toHaveAttribute(
      'href',
      expect.stringContaining('queue-table-by-status/q2'),
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('puts the queue with the longest wait first', () => {
    render(<ClinicOverview />);

    expect(queueNamesInOrder()).toEqual(['Clinician review', 'Triage', 'Antenatal']);
  });

  // The order above comes from the `rows` memo; Carbon only reaches `sortRow` once a header is clicked.
  it('sorts the longest wait numerically, keeping queues with no wait at the bottom either way', async () => {
    const user = userEvent.setup();
    render(<ClinicOverview />);

    const longestWait = within(screen.getByRole('columnheader', { name: /longest wait/i })).getByRole('button');

    await user.click(longestWait);
    expect(queueNamesInOrder()).toEqual(['Triage', 'Clinician review', 'Antenatal']);

    await user.click(longestWait);
    // 108 above 38 rather than '108' below '38', and the queue with no wait still last.
    expect(queueNamesInOrder()).toEqual(['Clinician review', 'Triage', 'Antenatal']);
  });

  it('scopes the metrics to the location selected in the shared store', () => {
    givenSelectedLocation('loc-2', 'MCH clinic');

    render(<ClinicOverview />);

    expect(mockUseClinicQueueMetrics).toHaveBeenCalledWith('loc-2', null);
  });

  it('narrows to the service selected in the shared store', () => {
    givenSelectedLocation('loc-2', 'MCH clinic', 'service-1');

    render(<ClinicOverview />);

    expect(mockUseClinicQueueMetrics).toHaveBeenCalledWith('loc-2', 'service-1');
  });

  it('requests the whole clinic when no location is selected', () => {
    render(<ClinicOverview />);

    expect(mockUseClinicQueueMetrics).toHaveBeenCalledWith(null, null);
  });

  it('shows a dash rather than a zero for a queue with nobody waiting', () => {
    render(<ClinicOverview />);

    const antenatal = screen.getByRole('row', { name: /antenatal/i });
    expect(within(antenatal).getAllByText('--').length).toBeGreaterThan(0);
  });

  it('renders an empty state when the clinic has no queues', () => {
    givenMetrics({ rollups: [] });
    render(<ClinicOverview />);

    expect(screen.getByText(/no queues to display/i)).toBeInTheDocument();
  });

  it('renders an error state when the roll-up fails', () => {
    givenMetrics({ error: new Error('boom') });
    render(<ClinicOverview />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
  });
});
