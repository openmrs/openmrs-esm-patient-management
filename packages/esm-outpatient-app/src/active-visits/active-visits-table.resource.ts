import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';

interface VisitQueueEntry {
  queueEntry: QueueEntry;
  uuid: string;
  visit: Visit;
}

interface QueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
  };
  priority: {
    display: string;
  };
  priorityComment: string | null;
  providerWaitingFor: null;
  queue: {
    description: string;
    display: string;
    name: string;
    service: {
      display: string;
    };
    uuid: string;
  };
  startedAt: string;
  status: {
    display: string;
  };
  uuid: string;
}

interface MappedQueueEntry {
  id: string;
  name: string;
  patientUuid: string;
  priority: string;
  priorityComment: string;
  service: string;
  status: string;
  waitTime: string;
}

interface UseVisitQueueEntries {
  visitQueueEntries: Array<MappedQueueEntry> | null;
  isLoading: boolean;
  isError: Error;
  isValidating?: boolean;
}

enum queuePriotity {
  EMERGENCY = 'Emergency',
  NOT_URGENT = 'Not Urgent',
  URGENT = 'Urgent',
}

export function useVisitQueueEntries(): UseVisitQueueEntries {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?v=full`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mapQueueEntryProperties = (queueEntry: QueueEntry): MappedQueueEntry => ({
    id: queueEntry.uuid,
    name: queueEntry.display,
    patientUuid: queueEntry.patient.uuid,
    priority: queueEntry.priority.display === queuePriotity.URGENT ? 'Priority' : queueEntry.priority.display,
    priorityComment: queueEntry.priorityComment,
    service: queueEntry.queue.service.display,
    status: queueEntry.status.display,
    waitTime: queueEntry.startedAt ? `${Math.abs(dayjs().diff(dayjs(queueEntry.startedAt), 'minutes'))}` : '--',
  });

  const mappedQueueEntries = data?.data?.results?.map((result) => result.queueEntry ?? {}).map(mapQueueEntryProperties);

  return {
    visitQueueEntries: mappedQueueEntries ? mappedQueueEntries : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
