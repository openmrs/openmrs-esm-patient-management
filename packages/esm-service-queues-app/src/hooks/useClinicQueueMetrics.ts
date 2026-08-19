import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type Queue, type QueueEntry } from '../types';
import { useQueueEntries } from './useQueueEntries';
import { useQueues } from './useQueues';

const clinicRollupRepresentation = 'custom:(uuid,startedAt,status:(uuid),queue:(uuid),patient:(uuid,person:(display)))';

interface Summary {
  waiting: number;
  attending: number;
  totalWaitMinutes: number;
  averageWaitMinutes: number | null;
  longestWait: { minutes: number; startedAt: Date; patientName: string } | null;
}

export interface QueueRollup extends Summary {
  queue: Queue;
}

const emptySummary: Summary = {
  waiting: 0,
  attending: 0,
  totalWaitMinutes: 0,
  averageWaitMinutes: null,
  longestWait: null,
};

function average(totalWaitMinutes: number, waiting: number) {
  return waiting === 0 ? null : Math.round(totalWaitMinutes / waiting);
}

export function useClinicQueueMetrics(locationUuid?: string) {
  const {
    concepts: { defaultStatusConceptUuid, defaultTransitionStatus },
  } = useConfig<ConfigObject>();

  const { queues, isLoading: isLoadingQueues, error: queuesError } = useQueues(locationUuid);
  const {
    queueEntries,
    isLoading: isLoadingEntries,
    error: entriesError,
  } = useQueueEntries({ location: locationUuid, isEnded: false }, clinicRollupRepresentation);

  const { rollups, totals } = useMemo(() => {
    const now = dayjs();

    const entriesByQueue = new Map<string, Array<QueueEntry>>();
    for (const entry of queueEntries) {
      const queueUuid = entry.queue?.uuid;
      if (queueUuid) {
        const bucket = entriesByQueue.get(queueUuid);
        if (bucket) {
          bucket.push(entry);
        } else {
          entriesByQueue.set(queueUuid, [entry]);
        }
      }
    }

    function summarise(entries: Array<QueueEntry>): Summary {
      const summary = { ...emptySummary };

      for (const entry of entries) {
        if (entry.status?.uuid === defaultTransitionStatus) {
          summary.attending++;
        } else if (entry.status?.uuid === defaultStatusConceptUuid) {
          const startedAt = new Date(entry.startedAt);
          const minutes = now.diff(startedAt, 'minute');
          summary.waiting++;
          summary.totalWaitMinutes += minutes;
          if (!summary.longestWait || minutes > summary.longestWait.minutes) {
            summary.longestWait = { minutes, startedAt, patientName: entry.patient?.person?.display ?? '' };
          }
        }
      }

      summary.averageWaitMinutes = average(summary.totalWaitMinutes, summary.waiting);
      return summary;
    }

    // Driven by the queue list, so a queue with nobody in it still gets a row of zeros.
    const rollups = queues.map<QueueRollup>((queue) => ({
      queue,
      ...summarise(entriesByQueue.get(queue.uuid) ?? []),
    }));

    // Folded from the rows rather than recomputed over every entry, so the totals always agree with
    // what is on screen even when an entry belongs to a queue outside the current location.
    const totals = rollups.reduce<Summary>(
      (running, rollup) => ({
        waiting: running.waiting + rollup.waiting,
        attending: running.attending + rollup.attending,
        totalWaitMinutes: running.totalWaitMinutes + rollup.totalWaitMinutes,
        averageWaitMinutes: null,
        longestWait:
          rollup.longestWait && (!running.longestWait || rollup.longestWait.minutes > running.longestWait.minutes)
            ? rollup.longestWait
            : running.longestWait,
      }),
      { ...emptySummary },
    );
    totals.averageWaitMinutes = average(totals.totalWaitMinutes, totals.waiting);

    return { rollups, totals };
  }, [queueEntries, queues, defaultStatusConceptUuid, defaultTransitionStatus]);

  return {
    rollups,
    totals,
    isLoading: isLoadingQueues || isLoadingEntries,
    error: queuesError ?? entriesError,
  };
}
