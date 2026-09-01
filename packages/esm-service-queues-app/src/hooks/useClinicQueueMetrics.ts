import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, parseDate, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Queue } from '../types';

interface LongestOpenWait {
  minutes: number;
  queueEntry: {
    uuid: string;
    startedAt: string;
    patient?: { uuid: string; display: string };
  };
}

interface CountMetrics {
  countsByStatus: Record<string, number>;
}

interface WaitMetrics {
  averageOpenWaitTime: number | null;
  longestOpenWait: LongestOpenWait | null;
}

/** A `groupBy=queue` response: the metrics over the whole set, then the same metrics per queue. */
type GroupedByQueue<T> = T & { queues: Array<T & { queue: Queue }> };

interface Summary {
  waiting: number;
  attending: number;
  averageWaitMinutes: number | null;
  longestWait: { minutes: number; startedAt: Date; patientName: string } | null;
}

export interface QueueRollup extends Summary {
  queue: Queue;
}

export function useClinicQueueMetrics(locationUuid?: string, serviceUuid?: string) {
  const {
    concepts: { waitingStatusConceptUuid, defaultTransitionStatus },
  } = useConfig<ConfigObject>();

  function metricsUrl(metrics: Array<string>, status?: string) {
    const searchParams = new URLSearchParams({ groupBy: 'queue', isEnded: 'false' });
    metrics.forEach((metric) => searchParams.append('metric', metric));
    if (locationUuid) {
      searchParams.append('location', locationUuid);
    }
    if (serviceUuid) {
      searchParams.append('service', serviceUuid);
    }
    if (status) {
      searchParams.append('status', status);
    }
    // The URL contains `/queue-entry`, so useMutateQueueEntries still revalidates these figures when
    // an entry is added, moved or ended.
    return `${restBaseUrl}/queue-entry-metric?${searchParams.toString()}`;
  }

  const counts = useSWR<{ data: GroupedByQueue<CountMetrics> }, Error>(metricsUrl(['countsByStatus']), openmrsFetch);

  // A separate request, scoped to waiting entries: the queue module ends an entry and starts a new
  // one at transition, so an In Service entry's `startedAt` is when service began rather than when
  // the patient joined the queue. Open waits rather than `averageWaitTime`, which the queue module
  // measures over waits that have already finished.
  const waits = useSWR<{ data: GroupedByQueue<WaitMetrics> }, Error>(
    metricsUrl(['averageOpenWaitTime', 'longestOpenWait'], waitingStatusConceptUuid),
    openmrsFetch,
  );

  const { rollups, totals } = useMemo(() => {
    function summarise(queueCounts?: CountMetrics, queueWaits?: WaitMetrics): Summary {
      const { countsByStatus } = queueCounts ?? {};
      const { averageOpenWaitTime, longestOpenWait } = queueWaits ?? {};
      return {
        // Only the two configured statuses are reported, so entries a deployment holds in some other
        // unfinished status count towards neither figure.
        waiting: countsByStatus?.[waitingStatusConceptUuid] ?? 0,
        attending: countsByStatus?.[defaultTransitionStatus] ?? 0,
        averageWaitMinutes: averageOpenWaitTime == null ? null : Math.round(averageOpenWaitTime),
        longestWait: longestOpenWait
          ? {
              minutes: longestOpenWait.minutes,
              startedAt: parseDate(longestOpenWait.queueEntry.startedAt),
              patientName: longestOpenWait.queueEntry.patient?.display ?? '',
            }
          : null,
      };
    }

    const countsResponse = counts.data?.data;
    const waitsResponse = waits.data?.data;
    // The wait request leaves out queues with nobody waiting, so the counts decide which rows exist.
    const waitsByQueueUuid = new Map((waitsResponse?.queues ?? []).map((entry) => [entry.queue.uuid, entry]));

    return {
      rollups: (countsResponse?.queues ?? []).map<QueueRollup>((entry) => ({
        queue: entry.queue,
        ...summarise(entry, waitsByQueueUuid.get(entry.queue.uuid)),
      })),
      totals: summarise(countsResponse, waitsResponse),
    };
  }, [counts.data, waits.data, waitingStatusConceptUuid, defaultTransitionStatus]);

  return {
    rollups,
    totals,
    isLoading: counts.isLoading || waits.isLoading,
    error: counts.error ?? waits.error,
  };
}
