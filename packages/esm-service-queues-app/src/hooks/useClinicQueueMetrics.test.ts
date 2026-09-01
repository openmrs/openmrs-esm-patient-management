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

function queue(display: string) {
  return { uuid: display.toLowerCase(), display };
}

function counts(display: string, waiting: number, attending: number) {
  return { queue: queue(display), countsByStatus: { [waitingUuid]: waiting, [attendingUuid]: attending } };
}

/** The hook makes two requests; answer each from its URL, as the server would. */
function givenResponses() {
  mockOpenmrsFetch.mockImplementation(
    (url: string) =>
      Promise.resolve({
        data: url.includes(`status=${waitingUuid}`)
          ? {
              averageOpenWaitTime: 26.4,
              longestOpenWait,
              // Antenatal has nobody waiting, so the wait request leaves it out entirely.
              queues: [{ queue: queue('Triage'), averageOpenWaitTime: 38, longestOpenWait }],
            }
          : {
              countsByStatus: { [waitingUuid]: 20, [attendingUuid]: 5 },
              queues: [counts('Triage', 12, 3), counts('Antenatal', 0, 0)],
            },
      }) as unknown as ReturnType<typeof openmrsFetch>,
  );
}

function requestedUrls() {
  return mockOpenmrsFetch.mock.calls.map(([url]) => url as string);
}

function countsUrl() {
  return requestedUrls().find((url) => !url.includes('status='));
}

function waitsUrl() {
  return requestedUrls().find((url) => url.includes('status='));
}

describe('useClinicQueueMetrics', () => {
  beforeEach(() => {
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(config);
    givenResponses();
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

  // Grouping on the server keeps the screen to two requests, rather than fetching every unfinished
  // queue entry at the location to count them here.
  it('asks for the metrics grouped by queue, scoped to the location, service and unfinished entries', () => {
    renderHook(() => useClinicQueueMetrics('loc-1', 'service-1'), { wrapper });

    expect(requestedUrls()).toHaveLength(2);
    requestedUrls().forEach((url) => {
      expect(url).toContain('groupBy=queue');
      expect(url).toContain('isEnded=false');
      expect(url).toContain('location=loc-1');
      expect(url).toContain('service=service-1');
    });
  });

  it('requests the whole clinic when no location or service is selected', () => {
    renderHook(() => useClinicQueueMetrics(), { wrapper });

    requestedUrls().forEach((url) => {
      expect(url).not.toContain('location=');
      expect(url).not.toContain('service=');
    });
  });

  // An In Service entry's `startedAt` is when service began, not when the patient joined the queue,
  // so counting it into the wait metrics would report time in service as waiting time. The open-wait
  // metrics, rather than `averageWaitTime`, which measures waits that have already finished.
  it('measures the waits over waiting entries alone, while counting every unfinished one', () => {
    renderHook(() => useClinicQueueMetrics(), { wrapper });

    const waitParams = new URL(waitsUrl(), 'http://localhost').searchParams;
    expect(waitParams.get('status')).toBe(waitingUuid);
    expect(waitParams.getAll('metric')).toEqual(['averageOpenWaitTime', 'longestOpenWait']);

    const countParams = new URL(countsUrl(), 'http://localhost').searchParams;
    expect(countParams.get('status')).toBeNull();
    expect(countParams.getAll('metric')).toEqual(['countsByStatus']);
  });

  it('surfaces a failed request', async () => {
    const error = new Error('boom');
    mockOpenmrsFetch.mockRejectedValue(error);

    const { result } = renderHook(() => useClinicQueueMetrics(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.rollups).toEqual([]);
  });
});
