import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { type Queue, type QueueEntry } from '../types';
import { useClinicQueueMetrics } from './useClinicQueueMetrics';
import { useQueueEntries } from './useQueueEntries';
import { useQueues } from './useQueues';

vi.mock('./useQueueEntries');
vi.mock('./useQueues');

const mockUseQueueEntries = vi.mocked(useQueueEntries);
const mockUseQueues = vi.mocked(useQueues);

const config = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
const waitingUuid = config.concepts.waitingStatusConceptUuid;
const attendingUuid = config.concepts.defaultTransitionStatus;

const NOW = new Date('2026-08-16T10:00:00.000Z');

function queue(uuid: string, display: string, serviceUuid?: string): Queue {
  return { uuid, display, name: display, service: serviceUuid ? { uuid: serviceUuid } : undefined } as Queue;
}

function entry(queueUuid: string, statusUuid: string, minutesAgo: number, patientName: string): QueueEntry {
  return {
    uuid: `${queueUuid}-${patientName}`,
    queue: { uuid: queueUuid },
    status: { uuid: statusUuid },
    startedAt: new Date(NOW.getTime() - minutesAgo * 60_000).toISOString(),
    patient: { person: { display: patientName } },
  } as unknown as QueueEntry;
}

function givenData(queues: Array<Queue>, queueEntries: Array<QueueEntry>) {
  mockUseQueues.mockReturnValue({ queues, isLoading: false, error: undefined } as ReturnType<typeof useQueues>);
  mockUseQueueEntries.mockReturnValue({ queueEntries, isLoading: false, error: undefined } as ReturnType<
    typeof useQueueEntries
  >);
}

describe('useClinicQueueMetrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(config);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('summarises each queue by status, wait and longest waiting patient', () => {
    givenData(
      [queue('q1', 'Triage'), queue('q2', 'Pharmacy')],
      [
        entry('q1', waitingUuid, 10, 'Ama'),
        entry('q1', waitingUuid, 30, 'Bo'),
        entry('q1', attendingUuid, 500, 'Cara'),
        entry('q2', waitingUuid, 8, 'Dan'),
      ],
    );

    const { result } = renderHook(() => useClinicQueueMetrics());

    const triage = result.current.rollups.find((rollup) => rollup.queue.uuid === 'q1');
    expect(triage.waiting).toBe(2);
    expect(triage.attending).toBe(1);
    // Cara has been attended to for 500 minutes; that must not touch the waiting figures.
    expect(triage.averageWaitMinutes).toBe(20);
    expect(triage.longestWait).toEqual(expect.objectContaining({ minutes: 30, patientName: 'Bo' }));
  });

  it('keeps a queue with no entries as a row of zeros rather than dropping it', () => {
    givenData([queue('q1', 'Triage'), queue('q2', 'Antenatal')], [entry('q1', waitingUuid, 10, 'Ama')]);

    const { result } = renderHook(() => useClinicQueueMetrics());

    const antenatal = result.current.rollups.find((rollup) => rollup.queue.uuid === 'q2');
    expect(antenatal).toEqual(
      expect.objectContaining({ waiting: 0, attending: 0, averageWaitMinutes: null, longestWait: null }),
    );
  });

  it('averages the clinic total by patient, not by queue', () => {
    givenData(
      [queue('q1', 'Triage'), queue('q2', 'Pharmacy')],
      [
        entry('q1', waitingUuid, 60, 'Ama'),
        entry('q1', waitingUuid, 60, 'Bo'),
        entry('q1', waitingUuid, 60, 'Cara'),
        entry('q2', waitingUuid, 20, 'Dan'),
        entry('q2', attendingUuid, 3, 'Eve'),
      ],
    );

    const { result } = renderHook(() => useClinicQueueMetrics());

    expect(result.current.totals.waiting).toBe(4);
    expect(result.current.totals.attending).toBe(1);
    // (60*3 + 20) / 4 = 50, not the unweighted mean of the two queue averages (40).
    expect(result.current.totals.averageWaitMinutes).toBe(50);
    expect(result.current.totals.longestWait.minutes).toBe(60);
  });

  it('excludes entries whose queue is absent from the totals as well as the rows', () => {
    givenData(
      [queue('q1', 'Triage')],
      [entry('q1', waitingUuid, 10, 'Ama'), entry('q-gone', waitingUuid, 99, 'Ghost')],
    );

    const { result } = renderHook(() => useClinicQueueMetrics());

    expect(result.current.rollups).toHaveLength(1);
    // Totals are folded from the rows, so they cannot disagree with what is on screen.
    expect(result.current.totals.waiting).toBe(1);
    expect(result.current.totals.longestWait.patientName).toBe('Ama');
  });

  it('scopes the request to the given location and service, and to unfinished entries', () => {
    givenData([], []);

    renderHook(() => useClinicQueueMetrics('loc-1', 'service-1'));

    expect(mockUseQueueEntries.mock.calls[0][0]).toEqual({
      location: 'loc-1',
      service: 'service-1',
      isEnded: false,
    });
  });

  // The queue search cannot narrow by service, so a row for a queue the entry search has already
  // excluded would otherwise sit there reading zero.
  it('drops queues outside the selected service', () => {
    givenData([queue('q1', 'Triage', 'service-1'), queue('q2', 'Antenatal', 'service-2')], []);

    const { result } = renderHook(() => useClinicQueueMetrics('loc-1', 'service-1'));

    expect(result.current.rollups.map((rollup) => rollup.queue.uuid)).toEqual(['q1']);
  });

  it('surfaces an error from either request', () => {
    const error = new Error('boom');
    givenData([], []);
    mockUseQueues.mockReturnValue({ queues: [], isLoading: false, error } as ReturnType<typeof useQueues>);

    const { result } = renderHook(() => useClinicQueueMetrics());

    expect(result.current.error).toBe(error);
  });
});
