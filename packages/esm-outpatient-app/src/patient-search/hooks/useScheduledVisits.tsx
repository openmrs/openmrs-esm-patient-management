import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useRecentScheduledVisits(patientUuid: string) {
  const recentVisits = [
    {
      id: '1',
      visit_type: 'Adult diabetes return visit',
      clinic: 'NCD clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
    {
      id: '2',
      visit_type: 'Adult HIV return visit',
      clinic: 'HIV clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
    {
      id: '3',
      visit_type: 'Adult HIV return visit',
      clinic: 'HIV clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
  ];

  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`endpoint?patient=${patientUuid}`, openmrsFetch);

  return {
    recentVisits: recentVisits,
    isError: error,
    isLoading: !data && !error,
  };
}

export function useFutureScheduledVisits(patientUuid: string) {
  const futureVisits = [
    {
      id: '1',
      visit_type: 'Adult HIV return visit',
      clinic: 'HIV clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
  ];

  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`endpoint?patient=${patientUuid}`, openmrsFetch);

  return {
    futureVisits: futureVisits,
    error: error,
    loading: !data && !error,
  };
}
