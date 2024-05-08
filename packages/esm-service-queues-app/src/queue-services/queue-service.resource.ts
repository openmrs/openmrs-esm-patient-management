import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useSystemSetting } from '../hooks/useSystemSetting';
import { useConcept } from '../hooks/useConcept';

export function useServiceConcepts() {
  const { systemSetting: serviceConceptSetting } = useSystemSetting('queue.serviceConceptSetName');
  const { concept: serviceConceptSet, error, isLoading } = useConcept(serviceConceptSetting?.value);
  return {
    queueConcepts: serviceConceptSet?.setMembers?.sort((c1, c2) => c1.display.localeCompare(c2.display)) || [],
    error,
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
