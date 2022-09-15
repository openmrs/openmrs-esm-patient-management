import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig, FetchResponse, openmrsObservableFetch, showToast } from '@openmrs/esm-framework';
import { PatientSearchResponse, SearchedPatient, User } from './types';
import { useTranslation } from 'react-i18next';

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

export function useUserUuid() {
  const { t } = useTranslation();
  const { data, error } = useSWRImmutable<FetchResponse<{ user: User }>, Error>('/ws/rest/v1/session', openmrsFetch);

  if (error) {
    showToast({
      kind: 'error',
      title: t('fetchingSessionFailed', 'Fetching session details failed'),
      description: error.message,
    });
  }

  const result = useMemo(
    () => ({
      isLoadingUser: !data && !error,
      user: data?.data?.user,
      userUuid: data?.data?.user?.uuid,
      patientsVisited: data?.data?.user?.userProperties?.patientsVisited,
    }),
    [data, error],
  );

  return result;
}

export function useRESTPatient(patientUuid: string) {
  const { t } = useTranslation();
  const { data, error } = useSWRImmutable<FetchResponse<SearchedPatient>, Error>(
    `/ws/rest/v1/patient/${patientUuid}?v=${v}`,
    openmrsFetch,
  );
  if (error) {
    showToast({
      kind: 'error',
      title: t('fetchingPatientFailed', 'Fetching patient details failed'),
      description: error.message,
    });
  }

  const results = useMemo(
    () => ({
      patient: data?.data,
      isLoading: !data && !error,
    }),
    [data, error],
  );

  return results;
}
