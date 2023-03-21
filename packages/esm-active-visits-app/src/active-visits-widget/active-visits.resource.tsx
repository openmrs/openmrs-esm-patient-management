import useSWR from 'swr';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import { openmrsFetch, Visit, useSession, FetchResponse } from '@openmrs/esm-framework';
import { useMemo } from 'react';

dayjs.extend(isToday);

export interface ActiveVisit {
  age: string;
  id: string;
  idNumber: string;
  gender: string;
  location: string;
  name: string;
  patientUuid: string;
  visitStartTime: string;
  visitType: string;
  visitUuid: string;
}

export function useActiveVisits(page: number, size: number) {
  const currentUserSession = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = currentUserSession?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,';
  // 'stopDatetime)&fromStartDate=' +
  // `${startDate}&location=${sessionLocation}`;

  let url = `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}&totalCount=true`;

  if (page) {
    url += `&startIndex=${page * size}`;
  }

  if (size) {
    url += `&limit=${size}`;
  }

  // const url = `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating } = useSWR<
    FetchResponse<{ results: Array<Visit>; links: Array<{ rel: string }>; totalCount: number }>,
    Error
  >(url, openmrsFetch);

  const mapVisitProperties = (visit: Visit): ActiveVisit => ({
    age: visit?.patient?.person?.age,
    id: visit.uuid,
    idNumber: visit?.patient?.identifiers[0]?.identifier,
    gender: visit?.patient?.person?.gender,
    location: visit?.location?.uuid,
    name: visit?.patient?.person?.display,
    patientUuid: visit?.patient?.uuid,
    visitStartTime: visit?.startDatetime,
    visitType: visit?.visitType?.display,
    visitUuid: visit.uuid,
  });

  const results = useMemo(() => {
    const formattedActiveVisits = data?.data?.results?.map(mapVisitProperties) ?? [];
    // .filter(({ visitStartTime }) => dayjs(visitStartTime).isToday()) ?? [];

    return {
      activeVisits: formattedActiveVisits,
      isLoading,
      isError: error,
      isValidating,
      totalResults: data?.data?.totalCount ?? 0,
    };
  }, [data, error, isLoading, isValidating]);
  return results;
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};
