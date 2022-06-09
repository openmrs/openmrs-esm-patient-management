import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';
import {
  QueuePriority,
  MappedQueuePriority,
  MappedEncounter,
  Encounter,
  QueueService,
  QueueStatus,
} from '../active-visits/active-visits-table.resource';
import { AppointmentsFetchResponse, Appointment } from '../types/index';

export interface VisitQueueEntry {
  queueEntry: VisitQueueEntry;
  uuid: string;
  visit: Visit;
}
export interface UseVisitQueueEntries {
  linelistsQueueEntries: Array<MappedVisitQueueEntry> | null;
  isLoading: boolean;
  isError: Error;
  isValidating?: boolean;
}

export interface VisitQueueEntry {
  display: string;
  endedAt: null;
  locationWaitingFor: string | null;
  patient: {
    uuid: string;
    person: {
      gender: string;
      age: number;
      birthdate: string;
    };
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
  provider: {
    name: string;
    role: string;
  };
}

export interface MappedVisitQueueEntry {
  id: string;
  encounters: Array<MappedEncounter>;
  name: string;
  age?: number;
  gender?: string;
  dob?: string;
  provider?: {
    name: string | null;
    role: string | null;
  };
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityComment: string;
  service: QueueService;
  status: QueueStatus;
  visitStartDateTime: string;
  visitType: string;
  visitUuid: string;
  waitTime: string;
}

export function useQueueDetails(): UseVisitQueueEntries {
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
    age: visitQueueEntry.queueEntry.patient.person.age,
    dob: visitQueueEntry.queueEntry.patient.person.birthdate,
    gender: visitQueueEntry.queueEntry.patient.person.gender,
    provider: {
      name: visitQueueEntry.provider?.name,
      role: visitQueueEntry.provider?.role,
    },
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
  });

  const mappedVisitQueueEntries = data?.data?.results?.map(mapVisitQueueEntryProperties);

  return {
    linelistsQueueEntries: mappedVisitQueueEntries ? mappedVisitQueueEntries : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function useAppointments() {
  const { data, error } = useSWR<{ data: { results: Array<Appointment> } }, Error>(
    `/ws/rest/v1/appointments`,
    openmrsFetch,
  );

  return {
    appointmentQueueEntries: data ? data.data?.results : null,
    isError: error,
    isLoading: !data && !error,
  };
}
