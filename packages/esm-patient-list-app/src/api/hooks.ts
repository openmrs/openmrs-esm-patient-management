import {
  CohortResponse,
  CohortType,
  OpenmrsCohort,
  OpenmrsCohortMember,
  PatientListFilter,
  PatientListType,
} from './types';
import { openmrsFetch, FetchResponse, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { cohortUrl, getAllPatientLists, getPatientListIdsForPatient, getPatientListMembers } from './api-remote';
import { ConfigSchema } from '../config-schema';
import { useEffect, useState } from 'react';

interface PatientListResponse {
  results: CohortResponse<OpenmrsCohort>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}

export function useAllPatientLists({ name, isStarred, type }: PatientListFilter) {
  const [totalResults, setTotalResults] = useState(0);
  const custom = 'custom:(uuid,name,description,display,size,attributes,cohortType)';
  const query: Array<[string, string]> = [
    ['v', custom],
    ['totalCount', 'true']
  ];
  const config = useConfig() as ConfigSchema;

  if (name) {
    query.push(['q', name]);
  }

  if (type === PatientListType.USER) {
    query.push(['cohortType', config.myListCohortTypeUUID]);
  } else if (type === PatientListType.SYSTEM) {
    query.push(['cohortType', config.systemListCohortTypeUUID]);
  }

  const params = query.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');

  const getUrl = (pageIndex, previousPageData: FetchResponse<PatientListResponse>) => {
    if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `${cohortUrl}/cohort?${params}`;

    if (pageIndex) {
      url += `&startIndex=${pageIndex * 50}`;
    }

    return url;
  };
  const {
    data,
    error,
    mutate,
    isValidating,
    isLoading,
    size: pageNumber,
    setSize,
  } = useSWRInfinite<FetchResponse<PatientListResponse>, Error>(getUrl, openmrsFetch);

  useEffect(() => {
    if (data && data?.[pageNumber - 1]?.data?.links?.some((link) => link.rel === 'next')) {
      setSize((currentSize) => currentSize + 1);
    }
  }, [data, pageNumber, setSize]);

  const patientListsData = data ? [].concat(...data?.map((res) => res?.data?.results)) : [];

  return {
    patientLists: patientListsData.map((cohort) => ({
      id: cohort.uuid,
      display: cohort.name,
      description: cohort.description,
      type: cohort.cohortType?.display,
      size: cohort.size,
    })),
    isLoading,
    isValidating,
    error,
    mutate,
    totalResults,
  };
}

export function useAllPatientListMembers(patientListId: string) {
  return useSWR(['patientListMembers', patientListId], () => getPatientListMembers(patientListId));
}

/**
 * A hook for querying all local and remote patient lists that exist for a given user,
 * but without those patient lists where a specific patient has already been added as a member.
 *
 * This is intended for displaying all lists to which a given patient can still be added.
 */
export function useAllPatientListsWhichDoNotIncludeGivenPatient(patientUuid: string) {
  const config = useConfig() as ConfigSchema;
  return useSWR(['patientListWithoutPatient', patientUuid], async () => {
    const [allLists, listsIdsOfThisPatient] = await Promise.all([
      getAllPatientLists({}, config?.myListCohortTypeUUID, config?.systemListCohortTypeUUID),
      getPatientListIdsForPatient(patientUuid),
    ]);

    const listsWithoutPatient = allLists.filter((list) => !listsIdsOfThisPatient.includes(list.id));
    return listsWithoutPatient;
  });
}

export function usePatientListDetails(patientListUuid: string) {
  const url = `${cohortUrl}/cohort/${patientListUuid}?v=custom:(uuid,name,description,display,size,attributes,startDate,endDate,cohortType)`;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<OpenmrsCohort>, Error>(
    patientListUuid ? url : null,
    openmrsFetch,
  );

  return {
    data: data?.data,
    error,
    isLoading,
    mutate,
  };
}

export function usePatientListMembers(
  patientListUuid: string,
  searchQuery: string = '',
  startIndex: number = 0,
  pageSize: number = 10,
  v: string = 'full',
) {
  const swrResult = useSWR<FetchResponse<CohortResponse<OpenmrsCohortMember>>, Error>(
    `${cohortUrl}/cohortmember?cohort=${patientListUuid}&startIndex=${startIndex}&limit=${pageSize}&v=${v}&q=${searchQuery}`,
    openmrsFetch,
  );
  return { ...swrResult, data: swrResult?.data?.data?.results };
}

export function useCohortTypes() {
  const swrResult = useSWR<FetchResponse<CohortResponse<CohortType>>, Error>(`${cohortUrl}/cohorttype`, openmrsFetch);
  return { ...swrResult, data: swrResult?.data?.data?.results };
}
