import { createElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
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

function queueMetrics(display: string, waiting: number, attending: number, averageOpenWaitTime: number | null) {
  return {
    queue: { uuid: display.toLowerCase(), display },
    countsByStatus: { [waitingUuid]: waiting, [attendingUuid]: attending },
    averageOpenWaitTime,
    longestOpenWait: averageOpenWaitTime === null ? null : longestOpenWait,
  };
}

function givenResponse(overrides: Record<string, unknown> = {}) {
  mockOpenmrsFetch.mockResolvedValue({
    data: {
      countsByStatus: { [waitingUuid]: 20, [attendingUuid]: 5 },
      averageOpenWaitTime: 26.4,
      longestOpenWait,
      queues: [queueMetrics('Triage', 12, 3, 38), queueMetrics('Antenatal', 0, 0, null)],
      ...overrides,
    },
  } as unknown as Awaited<ReturnType<typeof openmrsFetch>>);
}

function requestedUrl() {
  return mockOpenmrsFetch.mock.calls[0][0] as string;
}

describe('useClinicQueueMetrics', () => {
  beforeEach(() => {
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(config);
    givenResponse();
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

  // Grouping on the server means one request for the whole screen, rather than fetching every
  // unfinished queue entry at the location to count them here.
  it('asks for the metrics grouped by queue, scoped to the location, service and unfinished entries', () => {
    renderHook(() => useClinicQueueMetrics('loc-1', 'service-1'), { wrapper });

    expect(requestedUrl()).toContain('groupBy=queue');
    expect(requestedUrl()).toContain('isEnded=false');
    expect(requestedUrl()).toContain('location=loc-1');
    expect(requestedUrl()).toContain('service=service-1');
  });

  it('requests the whole clinic when no location or service is selected', () => {
    renderHook(() => useClinicQueueMetrics(), { wrapper });

    expect(requestedUrl()).not.toContain('location=');
    expect(requestedUrl()).not.toContain('service=');
  });

  // The screen reports on those still waiting, so it cannot use the metric that measures waits which
  // have already finished.
  it('asks for the open-wait metrics rather than the completed-wait average', () => {
    renderHook(() => useClinicQueueMetrics(), { wrapper });

    expect(requestedUrl()).toContain('metric=averageOpenWaitTime');
    expect(requestedUrl()).toContain('metric=longestOpenWait');
    expect(requestedUrl()).toContain('metric=countsByStatus');
    expect(new URL(requestedUrl(), 'http://localhost').searchParams.getAll('metric')).not.toContain('averageWaitTime');
  });

  it('surfaces a failed request', async () => {
    const error = new Error('boom');
    mockOpenmrsFetch.mockRejectedValue(error);

    const { result } = renderHook(() => useClinicQueueMetrics(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.rollups).toEqual([]);
  });
});
