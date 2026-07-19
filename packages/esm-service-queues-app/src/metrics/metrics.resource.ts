import { useSession, type Visit, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { type WaitTime } from '../types';

/**
 * Fetches currently-active visits at a location (defaults to the session location), deduped by patient.
 * By default only visits started today are included (for the "Checked in patients" metric); pass
 * `restrictToToday: false` to include all open visits regardless of start date.
 */
export function useActiveVisits(locationUuid?: string, restrictToToday: boolean = true) {
  const currentUserSession = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const location = locationUuid ?? currentUserSession?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)' +
    (restrictToToday ? '&fromStartDate=' + startDate : '') +
    '&location=' +
    location;
  const url = `${restBaseUrl}/visit?includeInactive=false&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    location ? url : null,
    openmrsFetch,
  );

  // Dedupe by patient UUID (first visit per patient).
  const activeVisitsByPatient = new Map<string, Visit>();

  data?.data?.results.forEach((visit) => {
    const patientUUID = visit.patient?.uuid;
    const isToday = dayjs(visit.startDatetime).isToday();
    if (patientUUID && (!restrictToToday || isToday) && !activeVisitsByPatient.has(patientUUID)) {
      activeVisitsByPatient.set(patientUUID, visit);
    }
  });

  const activeVisits = Array.from(activeVisitsByPatient.values());

  return {
    activeVisits,
    activeVisitsCount: activeVisits.length,
    isLoading,
    error,
    isValidating,
  };
}

export function useAverageWaitTime(serviceUuid: string, statusUuid: string) {
  const apiUrl = `${restBaseUrl}/queue-metrics?queue=${serviceUuid}&status=${statusUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: WaitTime }, Error>(
    serviceUuid && statusUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    waitTime: data ? data?.data : null,
    isLoading,
    error,
    isValidating,
    mutate,
  };
}

export function useServiceMetricsCount(service: string, location: string) {
  const status = 'Waiting';
  const apiUrl =
    `${restBaseUrl}/queue-entry-metrics?status=${status}&isEnded=false` +
    (service ? `&service=${service}` : '') +
    (location ? `&location=${location}` : '');

  const { data } = useSWR<
    {
      data: {
        count: number;
      };
    },
    Error
  >(service ? apiUrl : null, openmrsFetch);

  return {
    serviceCount: data ? data?.data?.count : 0,
  };
}
