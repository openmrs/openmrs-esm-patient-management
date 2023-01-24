import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig, FetchResponse, openmrsObservableFetch, showToast } from '@openmrs/esm-framework';
import { MPIConfig, PatientSearchResponse, SearchedPatient, SearchMode } from './types';
import { useTranslation } from 'react-i18next';
import { mapToOpenMRSPatient } from './mpi/utils';

const v =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(uuid,display)))';

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

export function useMPIPatientSearch(
  searchTerm: string,
  isIdBasedSearch: boolean,
  searching: boolean = true,
  pageSize: number = 10,
) {
  const baseUrl = 'https://namibia-mpi.globalhealthapp.net/Patient';
  const url = isIdBasedSearch ? `${baseUrl}/${searchTerm}` : `${baseUrl}?freetext=${searchTerm}`;
  const fetcher = (url) =>
    window.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer CA08A0AA4071ED118F9F0242AC130004F2D6D5AB1EA6819401B11B379D6D536017A06FB8E6C43A419769B96710F9DEFF`,
      },
    });
  const { data, error, isValidating } = useSWR(searching ? url : null, fetcher);

  return {
    data: null,
    isLoading: !data && !error,
    fetchError: error,
    hasMore: false,
    loadingNewData: isValidating,
    setPage: () => {},
    currentPage: null,
    totalResults: data?.[0]?.data?.totalCount,
  };
}

export function usePatientSearch(
  searchTerm: string,
  searchMode: SearchMode,
  mpiConfig: MPIConfig,
  includeDead: boolean,
  searching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = v,
): PatientSearchResponse {
  const getInternalUrl = useCallback(
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

  const getExternalUrl = useCallback(() => {
    if (mpiConfig?.baseAPIPath) {
      return mpiConfig.baseAPIPath.endsWith('/')
        ? mpiConfig.baseAPIPath + searchTerm
        : mpiConfig.baseAPIPath + '/' + searchTerm;
    }
    return null;
  }, [mpiConfig, searchTerm]);

  const emrResponse = useSWRInfinite<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }>; totalCount: number }>,
    Error
  >(searching && searchMode == 'Internal' ? getInternalUrl : null, openmrsFetch);

  const mpiResponse = useSWRImmutable(searching && searchMode == 'External' ? getExternalUrl : null, openmrsFetch);

  const results = useMemo(() => {
    const { data, isValidating, error, setSize, size } =
      searchMode == 'Internal' ? (emrResponse as any) : (mpiResponse as any);
    return {
      data: data
        ? searchMode == 'Internal'
          ? [].concat(...data?.map((resp) => resp?.data?.results))
          : [mapToOpenMRSPatient(data.data, mpiConfig.preferredPatientIdentifierTitle)]
        : null,
      isLoading: !data && !error,
      fetchError: isSoftError(error, searchMode) ? null : error,
      hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount || data?.length,
    };
  }, [searchMode, emrResponse, mpiResponse]);

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

export function useGetPatientAttributePhoneUuid(): string {
  const { t } = useTranslation();
  const { data, error } = useSWRImmutable<FetchResponse<{ results: Array<{ uuid: string }> }>>(
    '/ws/rest/v1/personattributetype?q=Telephone Number',
    openmrsFetch,
  );
  if (error) {
    showToast({
      description: `${t(
        'fetchingPhoneNumberUuidFailed',
        'Fetching Phone number attribute type UUID failed with error',
      )}: ${error?.message}`,
      kind: 'error',
    });
  }
  return data?.data?.results?.[0]?.uuid;
}

function isSoftError(error: any, searchMode: SearchMode): boolean {
  if (error && error.response.status == 500 && searchMode == 'External') {
    // Some external sources throw a server error when processing an ID based search operation that doesn't get a hit.
    // Ignore this error in such scenarios.
    return true;
  }
  // return false;
  return true;
}
