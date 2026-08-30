import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, parseDate, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Queue } from '../types';

// The roll-up reports on those still waiting, so it asks for the open-wait metrics rather than
// `averageWaitTime`, which the queue module measures over waits that have already finished.
const metrics = ['countsByStatus', 'averageOpenWaitTime', 'longestOpenWait'];

interface LongestOpenWait {
  minutes: number;
  queueEntry: {
    uuid: string;
    startedAt: string;
    patient?: { uuid: string; display: string };
  };
}

interface QueueEntryMetrics {
  countsByStatus: Record<string, number>;
  averageOpenWaitTime: number | null;
  longestOpenWait: LongestOpenWait | null;
}

interface QueueEntryMetricsResponse extends QueueEntryMetrics {
  queues: Array<QueueEntryMetrics & { queue: Queue }>;
}

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

  const searchParams = new URLSearchParams({ groupBy: 'queue', isEnded: 'false' });
  metrics.forEach((metric) => searchParams.append('metric', metric));
  if (locationUuid) {
    searchParams.append('location', locationUuid);
  }
  if (serviceUuid) {
    searchParams.append('service', serviceUuid);
  }

  // The URL contains `/queue-entry`, so useMutateQueueEntries still revalidates these figures when
  // an entry is added, moved or ended.
  const { data, isLoading, error } = useSWR<{ data: QueueEntryMetricsResponse }, Error>(
    `${restBaseUrl}/queue-entry-metric?${searchParams.toString()}`,
    openmrsFetch,
  );

  const { rollups, totals } = useMemo(() => {
    function summarise(queueMetrics: QueueEntryMetrics): Summary {
      const { countsByStatus, averageOpenWaitTime, longestOpenWait } = queueMetrics;
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

    const response = data?.data;
    return {
      rollups: (response?.queues ?? []).map<QueueRollup>((queue) => ({ queue: queue.queue, ...summarise(queue) })),
      totals: summarise(response ?? { countsByStatus: {}, averageOpenWaitTime: null, longestOpenWait: null }),
    };
  }, [data, waitingStatusConceptUuid, defaultTransitionStatus]);

  return { rollups, totals, isLoading, error };
}
