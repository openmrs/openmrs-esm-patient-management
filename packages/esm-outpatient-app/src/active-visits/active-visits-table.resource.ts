import dayjs from 'dayjs';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import {
  FetchResponse,
  openmrsFetch,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
  Visit,
} from '@openmrs/esm-framework';
import last from 'lodash-es/last';
import { MappedServiceQueueEntry, QueueEntryPayload, QueueServiceInfo } from '../types';

export type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
export type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
export type QueueService = 'Clinical consultation' | 'Triage';
export type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';

interface VisitQueueEntry {
  queueEntry: VisitQueueEntry;
  uuid: string;
  visit: Visit;
}

interface VisitQueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
    age: string;
    phoneNumber: string;
    gender: string;
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
  visit: Visit;
}

export interface MappedVisitQueueEntry {
  id: string;
  encounters: Array<MappedEncounter>;
  name: string;
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityComment: string;
  service: QueueService;
  status: QueueStatus;
  visitStartDateTime: string;
  visitType: string;
  visitUuid: string;
  waitTime: string;
  queueUuid: string;
}

interface UseVisitQueueEntries {
  visitQueueEntries: Array<MappedVisitQueueEntry> | null;
  isLoading: boolean;
  isError: Error;
  isValidating?: boolean;
}

interface ObsData {
  concept: {
    display: string;
    uuid: string;
  };
  value?: string | any;
  groupMembers?: Array<{
    concept: { uuid: string; display: string };
    value?: string | any;
  }>;
  obsDatetime: string;
}

interface Encounter {
  diagnoses: Array<any>;
  encounterDatetime: string;
  encounterProviders?: Array<{ provider: { person: { display: string } } }>;
  encounterType: { display: string; uuid: string };
  obs: Array<ObsData>;
  uuid: string;
  voided: boolean;
}

interface MappedEncounter extends Omit<Encounter, 'encounterType' | 'provider'> {
  encounterType: string;
  provider: string;
}

export function useServices(location: string) {
  const apiUrl = `/ws/rest/v1/queue?location=${location}`;
  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    services: data ? data?.data?.results : [],
  };
}

export function useStatus() {
  const config = useConfig();
  const {
    concepts: { statusConceptSetUuid },
  } = config;

  const apiUrl = `/ws/rest/v1/concept/${statusConceptSetUuid}`;
  const { data, error } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    statuses: data ? data?.data?.setMembers : [],
    isLoading: !data && !error,
  };
}

export function usePriority() {
  const config = useConfig();
  const {
    concepts: { priorityConceptSetUuid },
  } = config;

  const apiUrl = `/ws/rest/v1/concept/${priorityConceptSetUuid}`;
  const { data } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    priorities: data ? data?.data?.setMembers : [],
  };
}

export function useVisitQueueEntries(): UseVisitQueueEntries {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?v=full`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mapEncounterProperties = (encounter: Encounter): MappedEncounter => ({
    diagnoses: encounter.diagnoses,
    encounterDatetime: encounter.encounterDatetime,
    encounterType: encounter.encounterType.display,
    obs: encounter.obs,
    provider: encounter.encounterProviders[0]?.provider?.person?.display,
    uuid: encounter.uuid,
    voided: encounter.voided,
  });

  const mapVisitQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedVisitQueueEntry => ({
    id: visitQueueEntry.queueEntry.uuid,
    encounters: visitQueueEntry.visit?.encounters?.map(mapEncounterProperties),
    name: visitQueueEntry.queueEntry.display,
    patientUuid: visitQueueEntry.queueEntry.patient.uuid,
    // Map `Urgent` to `Priority` because it's easier to distinguish between tags named
    // `Priority` and `Not Urgent` rather than `Urgent` vs `Not Urgent`
    priority:
      visitQueueEntry.queueEntry.priority.display === 'Urgent'
        ? 'Priority'
        : visitQueueEntry.queueEntry.priority.display,
    priorityComment: visitQueueEntry.queueEntry.priorityComment,
    service: visitQueueEntry.queueEntry.queue.service.display,
    status: visitQueueEntry.queueEntry.status.display,
    waitTime: visitQueueEntry.queueEntry.startedAt
      ? `${dayjs().diff(dayjs(visitQueueEntry.queueEntry.startedAt), 'minutes')}`
      : '--',
    visitStartDateTime: visitQueueEntry.visit?.visitStartDateTime,
    visitType: visitQueueEntry.visit?.visitType?.display,
    visitUuid: visitQueueEntry.visit?.uuid,
    queueUuid: visitQueueEntry.queueEntry.queue.uuid,
  });

  const mappedVisitQueueEntries = data?.data?.results?.map(mapVisitQueueEntryProperties);

  return {
    visitQueueEntries: mappedVisitQueueEntries ? mappedVisitQueueEntries : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};

export async function updateQueueEntry(
  visitUuid: string,
  queueUuid: string,
  queueEntryUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  endedAt: Date,
  abortController: AbortController,
) {
  await Promise.all([endPatientStatus(queueUuid, abortController, queueEntryUuid, endedAt)]);

  return openmrsFetch(`/ws/rest/v1/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      visit: { uuid: visitUuid },
      queueEntry: {
        status: {
          uuid: status,
        },
        priority: {
          uuid: priority,
        },
        queue: {
          uuid: queueUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: toDateObjectStrict(toOmrsIsoString(new Date())),
      },
    },
  });
}

async function endPatientStatus(
  queueUuid: string,
  abortController: AbortController,
  queueEntryUuid: string,
  endedAt: Date,
) {
  await openmrsFetch(`/ws/rest/v1/queue/${queueUuid}/entry/${queueEntryUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      endedAt: endedAt,
    },
  });
}

export function useServiceQueueEntries() {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?v=full`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mapServiceQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedServiceQueueEntry => ({
    id: visitQueueEntry.queueEntry.uuid,
    name: visitQueueEntry.queueEntry.display,
    age: visitQueueEntry.patient ? visitQueueEntry.patient?.age : '--',
    returnDate: visitQueueEntry.visit?.visitStartDateTime,
    visitType: visitQueueEntry.visit?.visitType?.display,
    phoneNumber: visitQueueEntry.patient ? visitQueueEntry.patient?.phoneNumber : '--',
    gender: visitQueueEntry.patient ? visitQueueEntry.patient?.gender : '--',
    patientUuid: visitQueueEntry.queueEntry ? visitQueueEntry?.queueEntry.uuid : '--',
  });

  const mappedServiceQueueEntries = data?.data?.results?.map(mapServiceQueueEntryProperties);

  return {
    serviceQueueEntries: mappedServiceQueueEntries ? mappedServiceQueueEntries : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
