import { useMemo } from 'react';
import { useOpenmrsFetchAll, useSession, type Visit, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { type WaitTime } from '../types';

/**
 * Fetches today's currently-active visits at a location (defaults to the session location), deduped
 * by patient. Used both for the "Checked in patients" metric and for the pre-search shortlist in the
 * "Add patient to queue" workspace. All pages are fetched, so the result is never truncated at the
 * REST default page size.
 */
export function useActiveVisits(locationUuid?: string) {
  const currentUserSession = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const location = locationUuid ?? currentUserSession?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid,identifierType:(uuid,name)),' +
    'person:(uuid,display,age,gender,birthdate,preferredName,dead,deathDate)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)' +
    '&fromStartDate=' +
    startDate +
    '&location=' +
    location;
  const url = `${restBaseUrl}/visit?includeInactive=false&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useOpenmrsFetchAll<Visit>(location ? url : null);

  // Dedupe by patient UUID (first visit per patient). The server already restricts results to today
  // via fromStartDate, so no client-side date filter is needed.
  const activeVisits = useMemo(() => {
    const activeVisitsByPatient = new Map<string, Visit>();
    (data ?? []).forEach((visit) => {
      const patientUuid = visit.patient?.uuid;
      if (patientUuid && !activeVisitsByPatient.has(patientUuid)) {
        activeVisitsByPatient.set(patientUuid, visit);
      }
    });
    return Array.from(activeVisitsByPatient.values());
  }, [data]);

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
