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

interface Metrics {
  countsByStatus: Record<string, number>;
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

  const searchParams = new URLSearchParams({ groupBy: 'queue', isEnded: 'false' });
  ['countsByStatus', 'averageOpenWaitTime', 'longestOpenWait'].forEach((metric) =>
    searchParams.append('metric', metric),
  );
  if (locationUuid) {
    searchParams.append('location', locationUuid);
  }
  if (serviceUuid) {
    searchParams.append('service', serviceUuid);
  }
  // `waitStatus` scopes the two wait metrics without narrowing the counts: the queue module ends an
  // entry and starts a new one at transition, so an In Service entry's `startedAt` is when service
  // began rather than when the patient joined the queue. Open waits rather than `averageWaitTime`,
  // which the queue module measures over waits that have already finished.
  searchParams.append('waitStatus', waitingStatusConceptUuid);
  // The URL contains `/queue-entry`, so useMutateQueueEntries still revalidates these figures when
  // an entry is added, moved or ended.
  const apiUrl = `${restBaseUrl}/queue-entry-metric?${searchParams.toString()}`;

  const { data, isLoading, error } = useSWR<{ data: GroupedByQueue<Metrics> }, Error>(apiUrl, openmrsFetch);

  const { rollups, totals } = useMemo(() => {
    function summarise(metrics?: Metrics): Summary {
      const { countsByStatus, averageOpenWaitTime, longestOpenWait } = metrics ?? {};
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
      // The backend seeds a row for every queue at the location, so a queue nobody is waiting in comes
      // back with zero counts and a null wait rather than being absent.
      rollups: (response?.queues ?? []).map<QueueRollup>((entry) => ({
        queue: entry.queue,
        ...summarise(entry),
      })),
      totals: summarise(response),
    };
  }, [data, waitingStatusConceptUuid, defaultTransitionStatus]);

  return { rollups, totals, isLoading, error };
}
