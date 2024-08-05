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
export interface Provider {
  uuid: string;
  display: string;
  comments: string;
  response?: string;
  person: OpenmrsResource;
  location: string;
  serviceType: string;
}
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
  // Customize the representation as per your needs; only include essential fields if possible
  const customRepresentation =
    'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

  const encodedRepresentation = encodeURIComponent(customRepresentation);
  const url = `/ws/rest/v1/queue-entry?v=${encodedRepresentation}&patient=${patientUuid}&isEnded=false`;

  // Using SWR Immutable to prevent refetching unless needed
  const fetcher = async (url: string) => {
    const response = await openmrsFetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  };

  // Using useSWRImmutable to ensure the data is cached and only refetched when necessary
  const { data, error, isLoading, mutate } = useSWRImmutable<{ results: QueueEntryResponse[] }>(url, fetcher);

  const queueEntry = data?.results[0] || null;

  return { data: queueEntry, error, isLoading, mutate };
}
