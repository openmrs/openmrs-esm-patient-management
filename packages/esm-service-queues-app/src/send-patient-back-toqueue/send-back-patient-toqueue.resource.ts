import { openmrsFetch, type OpenmrsResource, type Patient, type Visit } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

interface Location {
  uuid: string;
  display?: string;
  name?: string;
}

interface Concept extends OpenmrsResource {
  setMembers?: Array<Concept>;
}
interface Provider extends OpenmrsResource {}

interface Queue {
  uuid: string;
  display: string;
  name: string;
  description: string;
  location: Location;
  service: Concept;
  allowedPriorities: Array<Concept>;
  allowedStatuses: Array<Concept>;
}

export interface QueueEntryResponse {
  uuid: string;
  display: string;
  queue: Queue;
  status: Concept;
  patient: Patient;
  visit: Visit;
  priority: Concept;
  priorityComment: string | null;
  sortWeight: number;
  startedAt: string;
  endedAt: string;
  locationWaitingFor: Location;
  queueComingFrom: Queue;
  providerWaitingFor: Provider;
  previousQueueEntry: QueueEntryResponse;
}

export function useQueueEntry(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,description,location:(uuid,display,links),service:(uuid,display,links),priorityConceptSet,statusConceptSet,allowedPriorities:(uuid,display,links),allowedStatuses:(uuid,display,links),links),status,patient:(uuid,display,person,identifiers:(uuid,display,identifier,identifierType)),visit:(uuid,display,startDatetime,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided),attributes:(uuid,display,value,attributeType)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/queue-entry?v=${encodedRepresentation}&patient=${patientUuid}&isEnded=false`;

  const fetcher = async (url: string) => {
    const response = await openmrsFetch(url);
    const data = await response.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR<{ results: QueueEntryResponse[] }>(url, fetcher);

  const queueEntry = data?.results[0] || null;

  return { data: queueEntry, error, isLoading, mutate };
}
