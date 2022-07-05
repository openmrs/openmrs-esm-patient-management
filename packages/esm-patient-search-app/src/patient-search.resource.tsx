import { useCallback, useMemo } from 'react';
import { openmrsFetch, FetchResponse } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { SearchedPatient, FHIRPatientSearchResponse, FHIRPatientType, PatientSearchResponse } from './types';

export function usePatientSearchFHIR(
  searchTerm: string,
  searching: boolean = true,
  resultsToFetch: number = 10,
  sort: string,
  page: number,
) {
  let url = `/ws/fhir2/R4/Patient?name:contains=${searchTerm}&_count=${resultsToFetch}`;
  if (page > 1) {
    url += `&_getpagesoffset=${(page - 1) * resultsToFetch}`;
  }
  if (sort) {
    url += `&_sort=${sort}`;
  }

  const { data, isValidating, error } = useSWR<FetchResponse<FHIRPatientSearchResponse>, Error>(
    searching ? url : null,
    openmrsFetch,
  );

  const results: {
    data: Array<FHIRPatientType>;
    isLoading: boolean;
    fetchError: any;
    hasMore: boolean;
    loadingNewData: boolean;
    totalResults: number;
  } = useMemo(
    () => ({
      data: data?.data?.entry?.map((entry) => entry.resource),
      isLoading: !data?.data && !error,
      fetchError: error,
      hasMore: data?.data?.link?.some((link) => link.relation === 'next'),
      loadingNewData: isValidating,
      totalResults: data?.data?.total,
    }),
    [data, isValidating, error],
  );

  return results;
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

  return results;
}
