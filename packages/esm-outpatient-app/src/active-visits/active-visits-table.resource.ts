import dayjs from 'dayjs';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { FetchResponse, openmrsFetch, Visit } from '@openmrs/esm-framework';

interface VisitQueueEntry {
  queueEntry: QueueEntry;
  uuid: string;
  visit: Visit;
}

export type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
export type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
export type QueueService = 'Clinical consultation' | 'Triage';
export type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';

interface QueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
  };
  priority: {
    display: QueuePriority;
  };
  priorityComment: string | null;
  providerWaitingFor: null;
  queue: {
    description: string;
    display: string;
    name: string;
    service: {
      display: QueueService;
    };
    uuid: string;
  };
  startedAt: string;
  status: {
    display: QueueStatus;
  };
  uuid: string;
}

export interface MappedQueueEntry {
  id: string;
  name: string;
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityComment: string;
  service: QueueService;
  status: QueueStatus;
  waitTime: string;
}

interface UseVisitQueueEntries {
  visitQueueEntries: Array<MappedQueueEntry> | null;
  isLoading: boolean;
  isError: Error;
  isValidating?: boolean;
}

export function useServices() {
  const serviceConceptSetUuid = '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a';
  const apiUrl = `/ws/rest/v1/concept/${serviceConceptSetUuid}`;

  const { data } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    services: data ? data?.data?.setMembers?.map((setMember) => setMember?.display) : [],
  };
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
    // Map `Urgent` to `Priority` because it's easier to distinguish between tags named
    // `Priority` and `Not Urgent` rather than `Urgent` vs `Not Urgent`
    priority: queueEntry.priority.display === 'Urgent' ? 'Priority' : queueEntry.priority.display,
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
