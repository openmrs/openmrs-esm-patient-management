import { useCallback, useMemo } from 'react';
import { openmrsFetch, FetchResponse, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { SearchedPatient, FHIRPatientSearchResponse, FHIRPatientType, PatientSearchResponse } from './types';

const v =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(name)))';

export function usePatientSearchPaginated(
  searchTerm: string,
  searching: boolean = true,
  resultsToFetch: number,
  page: number,
  customRepresentation: string = v,
) {
  const config = useConfig();
  let url = `/ws/rest/v1/patient?q=${searchTerm}&v=${customRepresentation}&limit=${resultsToFetch}&totalCount=true`;
  if (config.includeDead) {
    url += `&includeDead=${config?.includeDead}`;
  }
  if (page > 1) {
    url += `&startIndex=${(page - 1) * resultsToFetch}`;
  }

  const { data, isValidating, error } = useSWR<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }>; totalCount: number }>
  >(searching ? url : null, openmrsFetch);

  const results: {
    data: Array<SearchedPatient>;
    isLoading: boolean;
    fetchError: any;
    hasMore: boolean;
    loadingNewData: boolean;
    totalResults: number;
  } = useMemo(
    () => ({
      data: data?.data?.results,
      isLoading: !data?.data && !error,
      fetchError: error,
      hasMore: data?.data?.links?.some((link) => link.rel === 'next'),
      loadingNewData: isValidating,
      totalResults: data?.data?.totalCount,
    }),
    [data, isValidating, error],
  );

  return results;
}

export function usePatientSearchInfinite(
  searchTerm: string,
  includeDead: boolean,
  searching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = v,
): PatientSearchResponse {
  const getUrl = useCallback(
    (
      page,
      prevPageData: FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }> }>,
    ) => {
      if (prevPageData && !prevPageData?.data?.links.some((link) => link.rel === 'next')) {
        return null;
      }
      let url = `/ws/rest/v1/patient?q=${searchTerm}&v=${customRepresentation}&includeDead=${includeDead}&limit=${resultsToFetch}&totalCount=true`;
      if (page) {
        url += `&startIndex=${page * resultsToFetch}`;
      }
      return url;
    },
    [searchTerm, customRepresentation, includeDead, resultsToFetch],
  );

  const { data, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }>; totalCount: number }>,
    Error
  >(searching ? getUrl : null, openmrsFetch);

  const results = useMemo(
    () => ({
      data: data ? [].concat(...data?.map((resp) => resp?.data?.results)) : null,
      isLoading: !data && !error,
      fetchError: error,
      hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount,
    }),
    [data, isValidating, error, setSize, size],
  );

  return results;
}
