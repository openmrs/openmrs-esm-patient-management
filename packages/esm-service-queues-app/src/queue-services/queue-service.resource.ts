import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl } from '@openmrs/esm-framework';

export function useServiceConcepts() {
  const config = useConfig();
  const {
    concepts: { serviceConceptSetUuid },
  } = config;

  const apiUrl = `${restBaseUrl}/concept/${serviceConceptSetUuid}`;
  const { data, isLoading } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    queueConcepts: data ? data?.data?.setMembers : [],
    isLoading,
  };
}

export function saveQueue(queueName: string, queueConcept: string, queueDescription: string, queueLocation: string) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/queue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      name: queueName,
      description: queueDescription,
      service: { uuid: queueConcept },
      location: {
        uuid: queueLocation,
      },
    },
  });
}
