import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useCallback, useMemo } from 'react';
import { SearchedPatient } from '../types';

interface PatientSearchResponse {
  data?: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error;
  loadingNewData: boolean;
  hasMore: boolean;
  currentPage: number;
  setPage: (size: number | ((_size: number) => number)) => Promise<
    FetchResponse<{
      results: Array<SearchedPatient>;
      links: Array<{
        rel: 'prev' | 'next';
      }>;
    }>[]
  >;
}

const v =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(name)))';

export function usePatientSearch(
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
      let url = `/ws/rest/v1/patient?q=${searchTerm}&v=${customRepresentation}&includeDead=${includeDead}&limit=${resultsToFetch}`;
      if (page) {
        url += `&startIndex=${page * resultsToFetch}`;
      }
      return url;
    },
    [searchTerm, customRepresentation, includeDead, resultsToFetch],
  );

  const { data, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }> }>,
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
    }),
    [data, isValidating, error, setSize, size],
  );

  console.log(results);

  return results;
}
