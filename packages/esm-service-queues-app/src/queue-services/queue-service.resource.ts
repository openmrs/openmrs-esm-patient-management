import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useSystemSetting } from '../hooks/useSystemSetting';
import { useConcept } from '../hooks/useConcept';

export function useServiceConcepts() {
  const { data: serviceConceptSetting, isLoading } = useSystemSetting('queue.serviceConceptSetName');
  const { data: serviceConcepts, ...rest } =
    !isLoading && serviceConceptSetting ? useConcept(serviceConceptSetting.value)?.data.setMembers() : null;
  return {
    queueConcepts: serviceConcepts,
    ...rest,
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
