import { createElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { type FetchResponse, getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { useClinicQueueMetrics } from './useClinicQueueMetrics';

// A cache of its own per test, so one test's response is not served to the next from SWR's.
const wrapper = ({ children }) =>
  createElement(SWRConfig, { value: { dedupingInterval: 0, provider: () => new Map() } }, children);

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const config = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
const waitingUuid = config.concepts.waitingStatusConceptUuid;
const attendingUuid = config.concepts.defaultTransitionStatus;

const startedAt = '2026-08-16T08:00:00.000+0000';
const longestOpenWait = {
  minutes: 108,
  queueEntry: { uuid: 'entry-1', startedAt, patient: { uuid: 'p1', display: 'Achieng Otieno' } },
};

function queue(display: string) {
  return { uuid: display.toLowerCase(), display };
}

function counts(display: string, waiting: number, attending: number) {
  return { queue: queue(display), countsByStatus: { [waitingUuid]: waiting, [attendingUuid]: attending } };
}

const metrics = {
  countsByStatus: { [waitingUuid]: 20, [attendingUuid]: 5 },
  averageOpenWaitTime: 26.4,
  longestOpenWait,
  queues: [
    { ...counts('Triage', 12, 3), averageOpenWaitTime: 38, longestOpenWait },
    // The backend seeds a row for every queue at the location, so a queue nobody is waiting in comes
    // back with a null wait rather than being absent.
    { ...counts('Antenatal', 0, 0), averageOpenWaitTime: null, longestOpenWait: null },
  ],
};

function requestedUrls() {
  return mockOpenmrsFetch.mock.calls.map(([url]) => url as string);
}

function requestedParams() {
  return new URL(requestedUrls()[0], 'http://localhost').searchParams;
}

describe('useClinicQueueMetrics', () => {
  beforeEach(() => {
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(config);
    mockOpenmrsFetch.mockResolvedValue({ data: metrics } as unknown as FetchResponse);
  });

  it('maps each queue in the response to a row, and the whole-set figures to the totals', async () => {
    const { result } = renderHook(() => useClinicQueueMetrics(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.rollups).toHaveLength(2);
    expect(result.current.rollups[0]).toEqual(
      expect.objectContaining({
        waiting: 12,
        attending: 3,
        averageWaitMinutes: 38,
        longestWait: expect.objectContaining({ minutes: 108, patientName: 'Achieng Otieno' }),
      }),
    );
    // Rounded for display; the server reports the average to a fraction of a minute.
    expect(result.current.totals).toEqual(
      expect.objectContaining({ waiting: 20, attending: 5, averageWaitMinutes: 26 }),
    );
  });

  it('keeps a queue with nobody in it as a row of zeros rather than dropping it', async () => {
    const { result } = renderHook(() => useClinicQueueMetrics(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.rollups[1]).toEqual(
      expect.objectContaining({ waiting: 0, attending: 0, averageWaitMinutes: null, longestWait: null }),
    );
  });

  // Grouping on the server keeps the screen to one request, rather than fetching every unfinished
  // queue entry at the location to count them here.
  it('asks for the metrics grouped by queue, scoped to the location, service and unfinished entries', () => {
    renderHook(() => useClinicQueueMetrics('loc-1', 'service-1'), { wrapper });

    expect(requestedUrls()).toHaveLength(1);
    const params = requestedParams();
    expect(params.get('groupBy')).toBe('queue');
    expect(params.get('isEnded')).toBe('false');
    expect(params.get('location')).toBe('loc-1');
    expect(params.get('service')).toBe('service-1');
  });

  it('requests the whole clinic when no location or service is selected', () => {
    renderHook(() => useClinicQueueMetrics(), { wrapper });

    const params = requestedParams();
    expect(params.get('location')).toBeNull();
    expect(params.get('service')).toBeNull();
  });

  // An In Service entry's `startedAt` is when service began, not when the patient joined the queue,
  // so counting it into the wait metrics would report time in service as waiting time. `waitStatus`
  // scopes the two wait metrics without narrowing the counts, so one request measures both at one
  // instant. The open-wait metrics, rather than `averageWaitTime`, which measures finished waits.
  it('measures the waits over waiting entries alone, while counting every unfinished one', () => {
    renderHook(() => useClinicQueueMetrics(), { wrapper });

    const params = requestedParams();
    expect(params.get('waitStatus')).toBe(waitingUuid);
    expect(params.get('status')).toBeNull();
    expect(params.getAll('metric')).toEqual(['countsByStatus', 'averageOpenWaitTime', 'longestOpenWait']);
  });

  it('surfaces a failed request', async () => {
    const error = new Error('boom');
    mockOpenmrsFetch.mockRejectedValue(error);

    const { result } = renderHook(() => useClinicQueueMetrics(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.rollups).toEqual([]);
  });
});
