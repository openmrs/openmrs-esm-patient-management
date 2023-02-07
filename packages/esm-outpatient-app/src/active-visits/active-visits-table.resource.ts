import dayjs from 'dayjs';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import {
  FetchResponse,
  formatDate,
  openmrsFetch,
  parseDate,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
  Visit,
} from '@openmrs/esm-framework';
import last from 'lodash-es/last';
import { MappedServiceQueueEntry, QueueServiceInfo } from '../types';
import isEmpty from 'lodash-es/isEmpty';
import { useTranslation } from 'react-i18next';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

export type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
export type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
export type QueueService = 'Clinical consultation' | 'Triage';
export type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';

export interface VisitQueueEntry {
  queueEntry: VisitQueueEntry;
  uuid: string;
  visit: Visit;
}

export interface VisitQueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
    person: {
      age: string;
      gender: string;
      birthdate: string;
    };
    phoneNumber: string;
  };
  priority: {
    display: QueuePriority;
    uuid: string;
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
    location: {
      uuid: string;
      name: string;
    };
  };
  startedAt: string;
  status: {
    display: QueueStatus;
    uuid: string;
  };
  uuid: string;
  visit: Visit;
}

export interface MappedVisitQueueEntry {
  id: string;
  encounters: Array<MappedEncounter>;
  name: string;
  patientAge: string;
  patientSex: string;
  patientDob: string;
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityComment: string;
  priorityUuid: string;
  service: string;
  status: QueueStatus;
  statusUuid: string;
  visitStartDateTime: string;
  visitType: string;
  visitUuid: string;
  visitLocation: string;
  visitTypeUuid: string;
  waitTime: string;
  queueUuid: string;
  queueEntryUuid: string;
  queueLocation: string;
}

interface UseVisitQueueEntries {
  visitQueueEntries: Array<MappedVisitQueueEntry> | null;
  visitQueueEntriesCount: number;
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
  const { data, error, isLoading } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    statuses: data ? data?.data?.setMembers : [],
    isLoading,
  };
}

export function usePriority() {
  const config = useConfig();
  const {
    concepts: { priorityConceptSetUuid },
  } = config;

  const apiUrl = `/ws/rest/v1/concept/${priorityConceptSetUuid}`;
  const { data, error, isLoading } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    priorities: data ? data?.data?.setMembers : [],
    isLoading,
    isError: error,
  };
}

export function useVisitQueueEntries(currServiceName: string, locationUuid: string): UseVisitQueueEntries {
  const { queueLocations } = useQueueLocations();
  const queueLocationUuid = locationUuid ? locationUuid : queueLocations[0]?.id;

  const apiUrl = `/ws/rest/v1/visit-queue-entry?location=${queueLocationUuid}&v=full`;
  const { t } = useTranslation();
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
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
    patientAge: visitQueueEntry.queueEntry.patient.person?.age,
    patientSex: visitQueueEntry.queueEntry.patient.person?.gender === 'M' ? 'MALE' : 'FEMALE',
    patientDob: visitQueueEntry?.queueEntry?.patient?.person?.birthdate
      ? formatDate(parseDate(visitQueueEntry.queueEntry.patient.person.birthdate), { time: false })
      : '--',
    // Map `Urgent` to `Priority` because it's easier to distinguish between tags named
    // `Priority` and `Not Urgent` rather than `Urgent` vs `Not Urgent`
    priority:
      visitQueueEntry.queueEntry.priority.display === 'Urgent'
        ? 'Priority'
        : visitQueueEntry.queueEntry.priority.display,
    priorityComment: visitQueueEntry.queueEntry.priorityComment,
    priorityUuid: visitQueueEntry.queueEntry.priority.uuid,
    service: visitQueueEntry?.queueEntry.queue.name,
    status: visitQueueEntry.queueEntry.status.display,
    statusUuid: visitQueueEntry.queueEntry.status.uuid,
    waitTime: visitQueueEntry.queueEntry.startedAt
      ? `${dayjs().diff(dayjs(visitQueueEntry.queueEntry.startedAt), 'minutes')}`
      : '--',
    visitStartDateTime: visitQueueEntry.visit?.visitStartDateTime,
    visitType: visitQueueEntry.visit?.visitType?.display,
    visitLocation: visitQueueEntry.visit?.location?.uuid,
    queueLocation: visitQueueEntry.queueEntry?.queue?.location?.uuid,
    visitTypeUuid: visitQueueEntry.visit?.visitType?.uuid,
    visitUuid: visitQueueEntry.visit?.uuid,
    queueUuid: visitQueueEntry.queueEntry.queue.uuid,
    queueEntryUuid: visitQueueEntry.queueEntry.uuid,
  });

  let mappedVisitQueueEntries;

  if (!currServiceName || currServiceName == t('all', 'All')) {
    mappedVisitQueueEntries = data?.data?.results?.map(mapVisitQueueEntryProperties);
  } else {
    mappedVisitQueueEntries = data?.data?.results
      ?.map(mapVisitQueueEntryProperties)
      .filter((data) => data.service === currServiceName);
  }

  return {
    visitQueueEntries: mappedVisitQueueEntries ? mappedVisitQueueEntries : [],
    visitQueueEntriesCount: mappedVisitQueueEntries ? mappedVisitQueueEntries.length : 0,
    isLoading,
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
  previousQueueUuid: string,
  newQueueUuid: string,
  queueEntryUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  endedAt: Date,
  abortController: AbortController,
) {
  const queueServiceUuid = isEmpty(newQueueUuid) ? previousQueueUuid : newQueueUuid;

  await Promise.all([endPatientStatus(previousQueueUuid, abortController, queueEntryUuid, endedAt)]);

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
          uuid: queueServiceUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: toDateObjectStrict(toOmrsIsoString(new Date())),
      },
    },
  });
}

export async function endPatientStatus(
  previousQueueUuid: string,
  abortController: AbortController,
  queueEntryUuid: string,
  endedAt: Date,
) {
  await openmrsFetch(`/ws/rest/v1/queue/${previousQueueUuid}/entry/${queueEntryUuid}`, {
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

export function useServiceQueueEntries(service: string, locationUuid: string) {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?status=waiting&service=${service}&location=${locationUuid}&v=full`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mapServiceQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedServiceQueueEntry => ({
    id: visitQueueEntry.queueEntry.uuid,
    name: visitQueueEntry.queueEntry.display,
    age: visitQueueEntry.queueEntry.patient ? visitQueueEntry?.queueEntry?.patient?.person?.age : '--',
    returnDate: visitQueueEntry.visit?.visitStartDateTime,
    visitType: visitQueueEntry.visit?.visitType?.display,
    phoneNumber: visitQueueEntry.patient ? visitQueueEntry.patient?.phoneNumber : '--',
    gender: visitQueueEntry.queueEntry.patient ? visitQueueEntry?.queueEntry?.patient?.person?.gender : '--',
    patientUuid: visitQueueEntry.queueEntry ? visitQueueEntry?.queueEntry.uuid : '--',
  });

  const mappedServiceQueueEntries = data?.data?.results?.map(mapServiceQueueEntryProperties);

  return {
    serviceQueueEntries: mappedServiceQueueEntries ? mappedServiceQueueEntries : [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export async function addQueueEntry(
  visitUuid: string,
  queueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  abortController: AbortController,
) {
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
