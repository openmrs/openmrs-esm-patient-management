import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig, FetchResponse, openmrsObservableFetch, showToast } from '@openmrs/esm-framework';
import { PatientSearchResponse, SearchedPatient } from './types';
import { useTranslation } from 'react-i18next';
import { patientsByFreeTextSearch, patientsById } from './mpi/mock';
import { mapToOpenMRSBundle } from './mpi/utils';

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
  dataSource: 'EMR' | 'MPI',
  includeDead: boolean,
  searching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = v,
): PatientSearchResponse {
  const [refinedSearchTerm, setRefinedSearchTerm] = useState(searchTerm);

  const isIdentifierBased = useMemo(() => {
    if (searchTerm.includes(':')) {
      const parts = searchTerm.split(':');
      setRefinedSearchTerm(parts[1]);
      return parts[0] == 'id';
    } else {
      setRefinedSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  const getUrlEMR = useCallback(
    (
      page,
      prevPageData: FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }> }>,
    ) => {
      if ((prevPageData && !prevPageData?.data?.links.some((link) => link.rel === 'next')) || dataSource == 'MPI') {
        return null;
      }
      let url = `/ws/rest/v1/patient?q=${searchTerm}&v=${customRepresentation}&includeDead=${includeDead}&limit=${resultsToFetch}&totalCount=true`;
      if (page) {
        url += `&startIndex=${page * resultsToFetch}`;
      }
      return url;
    },
    [searchTerm, customRepresentation, includeDead, resultsToFetch, dataSource],
  );

  const mpiUrl = useMemo(() => {
    if (dataSource == 'EMR') {
      return null;
    }
    const baseUrl = 'https://namibia-mpi.globalhealthapp.net/Patient';
    return isIdentifierBased ? `${baseUrl}/${searchTerm}` : `${baseUrl}?freetext=${searchTerm}`;
  }, [dataSource, isIdentifierBased, searchTerm]);

  const mpiFetcher = (url) => {
    if (!url) {
      return Promise.resolve(null);
    }
    if (isIdentifierBased) {
      return Promise.resolve(patientsById[refinedSearchTerm]).then((response) => {
        return mapToOpenMRSBundle(response);
      });
    }

    return Promise.resolve(patientsByFreeTextSearch[refinedSearchTerm]).then((response) => {
      return mapToOpenMRSBundle(response);
    });
  };

  const emrResponse = useSWRInfinite<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }>; totalCount: number }>,
    Error
  >(searching ? getUrlEMR : null, openmrsFetch);

  const mpiResponse = useSWR(searching ? mpiUrl : null, mpiFetcher);

  const results = useMemo(() => {
    const { data, isValidating, error, setSize, size } =
      dataSource == 'EMR' ? (emrResponse as any) : (mpiResponse as any);

    return {
      data: data ? (dataSource == 'EMR' ? [].concat(...data?.map((resp) => resp?.data?.results)) : data) : null,
      isLoading: !data && !error,
      fetchError: error,
      hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount || data?.length,
    };
  }, [dataSource, emrResponse, mpiResponse]);

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
