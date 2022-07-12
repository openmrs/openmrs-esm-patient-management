import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';

interface ConceptMetadataResponse {
  setMembers: Array<{
    display: string;
    uuid: string;
  }>;
}

export function useMetrics() {
  const metrics = { scheduled_appointments: 100, average_wait_time: 28, patients_waiting_for_service: 182 };
  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`/ws/rest/v1/queue?`, openmrsFetch);

  return {
    // Returns placeholder mock data, soon to be replaced with actual data from the backend
    metrics: metrics,
    isError: error,
    isLoading: !data && !error,
  };
}

export function useServices() {
  const config = useConfig();
  const {
    concepts: { serviceConceptSetUuid },
  } = config;

  const apiUrl = `/ws/rest/v1/concept/${serviceConceptSetUuid}`;
  const { data } = useSWRImmutable<{ data: ConceptMetadataResponse }, Error>(apiUrl, openmrsFetch);

  return {
    services: data ? data?.data?.setMembers?.map((setMember) => setMember?.display) : [],
  };
}

export function useServiceMetricsCount(service: string) {
  const status = 'Waiting';
  const apiUrl = `/ws/rest/v1/queue-entry-metrics?service=${service}&status=${status}`;
  const { data } = useSWRImmutable<
    {
      data: {
        count: number;
      };
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    serviceCount: data ? data?.data?.count : 0,
  };
}
