import { openmrsFetch, restBaseUrl, fhirBaseUrl } from '@openmrs/esm-framework';
import { type FHIRResource } from '@openmrs/esm-framework/src/types';
import { type CareTeamMember } from './types';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isEmpty from 'lodash-es/isEmpty';
import useSWR from 'swr';
import type { Diagnosis } from '@openmrs/esm-framework';
import { type Concept, type Identifer, type MappedServiceQueueEntry, type Queue, type QueueEntry } from './types';

dayjs.extend(isToday);

export interface MappedEncounter {
  diagnoses?: Array<Diagnosis>;
  encounterDatetime: string;
  encounterType: string;
  obs: Array<{
    concept: { display: string; uuid: string };
    obsDatetime: string;
    value: string | number | object;
    voided: boolean;
  }>;
  provider?: string;
  uuid: string;
  voided: boolean;
}

export interface MappedVisitQueueEntry {
  id: string;
  encounters?: Array<MappedEncounter>;
  name: string;
  patientUuid: string;
  patientAge: string;
  patientDob: string;
  patientGender: string;
  queue: Queue;
  priority: string;
  priorityComment: string;
  status?: string;
  startedAt: Date;
  endedAt: Date | null;
  visitType: string;
  queueLocation: string;
  visitTypeUuid: string;
  visitUuid: string;
  queueUuid: string;
  queueEntryUuid: string;
  sortWeight: number;
  visitQueueNumber?: string;
  identifiers: Array<Identifer>;
  queueComingFrom?: string;
}

interface Encounter {
  diagnoses?: Array<Diagnosis>;
  encounterDatetime?: string;
  encounterProviders?: Array<{ provider?: { person?: { display?: string } } }>;
  encounterType?: { display: string; uuid: string };
  obs?: Array<any>;
  uuid?: string;
  voided?: boolean;
}

type CoreEncounter = Encounter;

const mapEncounterProperties = (encounter: CoreEncounter): MappedEncounter => ({
  diagnoses: encounter.diagnoses,
  encounterDatetime: encounter.encounterDatetime,
  encounterType: encounter.encounterType.display,
  obs: encounter.obs,
  provider: encounter.encounterProviders?.[0]?.provider?.person?.display ?? '--',
  uuid: encounter.uuid,
  voided: encounter.voided,
});

type VisitAttribute = {
  attributeType?: {
    uuid?: string;
  };
  value?: string;
};

interface UpdateQueueBody {
  visit: { uuid: string };
  queueEntry: {
    status: { uuid: string };
    priority: { uuid: string };
    queue: { uuid: string };
    patient: { uuid: string };
    startedAt: Date;
    sortWeight: number;
    queueComingFrom: string;
  };
}

type QueueResponse = {
  data: {
    results: VisitQueueEntry[];
  };
};

export const mapVisitQueueEntryProperties = (
  queueEntry: QueueEntry,
  visitQueueNumberAttributeUuid: string,
): MappedVisitQueueEntry => ({
  id: queueEntry.uuid,
  encounters: queueEntry.visit?.encounters?.map(mapEncounterProperties) ?? [],
  name: queueEntry.display,
  patientUuid: queueEntry.patient.uuid,
  patientAge: queueEntry.patient.person?.age?.toString(),
  patientDob: queueEntry?.patient?.person?.birthdate
    ? formatDate(parseDate(queueEntry.patient.person.birthdate), { time: false })
    : '--',
  patientGender: queueEntry.patient.person?.gender,
  queue: queueEntry.queue,
  priority: queueEntry.priority,
  priorityComment: queueEntry.priorityComment,
  status: queueEntry?.status,
  startedAt: dayjs(queueEntry.startedAt).toDate(),
  endedAt: queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null,
  visitType: queueEntry.visit?.visitType?.display,
  queueLocation: queueEntry.queue?.location?.uuid,
  visitTypeUuid: queueEntry.visit?.visitType?.uuid,
  visitUuid: queueEntry.visit?.uuid,
  queueUuid: queueEntry.queue.uuid,
  queueEntryUuid: queueEntry.uuid,
  sortWeight: queueEntry.sortWeight,
  visitQueueNumber: queueEntry.visit?.attributes?.find((e: VisitAttribute) => e.attributeType?.uuid === visitQueueNumberAttributeUuid)
    ?.value,
  identifiers: queueEntry.patient?.identifiers ?? [],
  queueComingFrom: queueEntry?.queueComingFrom?.name,
});

export async function updateQueueEntry(
  visitUuid: string,
  previousQueueUuid: string,
  newQueueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  endedAt: Date | null,
  sortWeight: number,
): Promise<Response> {
  const abortController = new AbortController();
  const queueServiceUuid = isEmpty(newQueueUuid) ? previousQueueUuid : newQueueUuid;

  return openmrsFetch(`${restBaseUrl}/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: <UpdateQueueBody>{
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
        startedAt: new Date(),
        sortWeight: sortWeight,
        queueComingFrom: previousQueueUuid,
      },
    },
  });
}

export async function endPatientStatus(previousQueueUuid: string, queueEntryUuid: string) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/visit-queue-entry/${queueEntryUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      status: {
        uuid: 'completed',
      },
      endedAt: new Date(),
      queueComingFrom: previousQueueUuid,
    },
  });
}

export function useServiceQueueEntries(service: string, locationUuid: string) {
  const apiUrl = `${restBaseUrl}/visit-queue-entry?status=waiting&service=${service}&location=${locationUuid}&v=full`;
  const { data, error, isLoading, isValidating } = useSWR<QueueResponse, Error>(
    service && locationUuid ? apiUrl : null,
    openmrsFetch,
  );

  const mapServiceQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedServiceQueueEntry => ({
    id: visitQueueEntry.queueEntry.uuid,
    name: visitQueueEntry.queueEntry.display,
    age: visitQueueEntry.queueEntry.patient ? visitQueueEntry?.queueEntry?.patient?.person?.age?.toString() : '--',
    returnDate: visitQueueEntry.queueEntry.startedAt,
    visitType: visitQueueEntry.visit?.visitType?.display,
    gender: visitQueueEntry.queueEntry.patient ? visitQueueEntry?.queueEntry?.patient?.person?.gender : '--',
    patientUuid: visitQueueEntry.queueEntry.patient.uuid,
  });

  return useMemo(
    () => ({
      queueEntries: data?.data?.results?.map(mapServiceQueueEntryProperties),
      isLoading,
      isValidating,
      error,
    }),
    [data, isLoading, isValidating, error],
  );
}

export function useQueueEntries(filters: { queue: string; isEnded?: boolean }) {
  const apiUrl = filters.queue
    ? `${restBaseUrl}/visit-queue-entry?queue=${filters.queue}&isEnded=${filters.isEnded ?? false}&v=full`
    : null;

  const { data, error, isLoading, isValidating } = useSWR<QueueResponse, Error>(apiUrl, openmrsFetch);

  return useMemo(
    () => ({
      queueEntries: data?.data?.results?.map((entry) => mapVisitQueueEntryProperties(entry, '')) ?? [],
      isLoading,
      isValidating,
      error,
    }),
    [data, isLoading, isValidating, error],
  );
}

interface VisitQueueEntry {
  visit?: {
    visitType?: { display: string; uuid: string };
    encounters?: Array<Encounter>;
    attributes?: Array<VisitAttribute>;
    uuid?: string;
  };
  queueEntry: QueueEntry;
}

// Helper imports that might be missing
const formatDate = (date: Date, options?: any) => date.toISOString();
const parseDate = (dateString: string) => new Date(dateString);
const { useMemo } = require('react');
