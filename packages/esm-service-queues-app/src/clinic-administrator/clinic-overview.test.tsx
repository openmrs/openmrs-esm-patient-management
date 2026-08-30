import React from 'react';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { useClinicQueueMetrics } from '../hooks/useClinicQueueMetrics';
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

function rollup(queue: Queue, waiting: number, attending: number, longestWaitMinutes: number | null, patient = '') {
  return {
    queue,
    waiting,
    attending,
    totalWaitMinutes: longestWaitMinutes ?? 0,
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

function givenMetrics(overrides: Partial<ReturnType<typeof useClinicQueueMetrics>> = {}) {
  mockUseClinicQueueMetrics.mockReturnValue({
    rollups,
    totals: {
      waiting: 20,
      attending: 5,
      totalWaitMinutes: 520,
      averageWaitMinutes: 26,
      longestWait: { minutes: 108, startedAt: new Date(), patientName: 'Achieng Otieno' },
    },
    isLoading: false,
    error: undefined,
    ...overrides,
  } as ReturnType<typeof useClinicQueueMetrics>);
}

function givenSelectedLocation(uuid: string | null, name: string | null = null, serviceUuid: string | null = null) {
  mockUseServiceQueuesStore.mockReturnValue({
    selectedQueueLocationUuid: uuid,
    selectedQueueLocationName: name,
    selectedServiceUuid: serviceUuid,
  } as ReturnType<typeof useServiceQueuesStore>);
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

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Clinician review');
    expect(rows[rows.length - 1]).toHaveTextContent('Antenatal');
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
