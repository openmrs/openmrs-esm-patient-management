import { useSession, Visit, openmrsFetch } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { WaitTime } from '../types';

export function useActiveVisits() {
  const currentUserSession = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = currentUserSession?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)&fromStartDate=' +
    startDate +
    '&location=' +
    sessionLocation;
  const url = `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    sessionLocation ? url : null,
    openmrsFetch,
  );

  const activeVisitsCount = data?.data?.results.length
    ? data.data.results.filter((visit) => dayjs(visit.startDatetime).isToday())?.length
    : 0;

  return {
    activeVisitsCount: activeVisitsCount,
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useAverageWaitTime(serviceUuid: string, statusUuid: string) {
  const apiUrl = `/ws/rest/v1/queue-metrics?queue=${serviceUuid}&status=${statusUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: WaitTime }, Error>(
    serviceUuid && statusUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    waitTime: data ? data?.data : null,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
