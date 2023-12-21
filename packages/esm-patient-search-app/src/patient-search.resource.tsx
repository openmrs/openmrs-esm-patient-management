import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, showNotification, useSession, type FetchResponse, LoggedInUser } from '@openmrs/esm-framework';
import type { PatientSearchResponse, SearchedPatient, User } from './types';

const v =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(uuid,display)))';

export function useInfinitePatientSearch(
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

  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }>; totalCount: number }>,
    Error
  >(searching ? getUrl : null, openmrsFetch);

  const results = useMemo(
    () => ({
      data: data ? [].concat(...data?.map((resp) => resp?.data?.results)) : null,
      isLoading: isLoading,
      fetchError: error,
      hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount,
    }),
    [data, isLoading, isValidating, error, setSize, size],
  );

  return results;
}

export function useRecentlyViewedPatients() {
  const { t } = useTranslation();
  const { user } = useSession();
  const userUuid = user?.uuid;
  const { data, error, mutate } = useSWR<FetchResponse<User>, Error>(
    userUuid ? `/ws/rest/v1/user/${userUuid}` : null,
    openmrsFetch,
  );

  useEffect(() => {
    if (error) {
      showNotification({
        kind: 'error',
        title: t('errorFetchingUserProperties', 'Error fetching user properties'),
        description: error.message,
      });
    }
  }, [error, t]);

  const addViewedPatient = useCallback(
    (patientUuid: string) => {
      const userProperties: Record<string, string> = data?.data?.userProperties ?? {};
      const recentlyViewedPatients: Array<string> = userProperties.patientsVisited?.split(',') ?? [];
      const remainingPatients = recentlyViewedPatients.filter((uuid) => uuid !== patientUuid);
      const newUserProperties = { ...userProperties, patientsVisited: [patientUuid, ...remainingPatients].join(',') };

      return openmrsFetch(`/ws/rest/v1/user/${user?.uuid}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          userProperties: newUserProperties,
        },
      });
    },
    [data?.data?.userProperties, user],
  );

  const result = useMemo(
    () => ({
      isLoadingPatients: !data && !error,
      recentlyViewedPatients: data?.data?.userProperties?.patientsVisited?.split(',') ?? [],
      addViewedPatient,
      mutateUserProperties: mutate,
    }),
    [data, error, mutate],
  );

  return result;
}

export function useRESTPatients(
  patientUuids: string[],
  searching: boolean = true,
  resultsToFetch: number = 10,
  customRepresentation: string = v,
): PatientSearchResponse {
  const { t } = useTranslation();

  const getPatientUrl = (index) => {
    if (index < patientUuids.length) {
      return `/ws/rest/v1/patient/${patientUuids[index]}?v=${customRepresentation}`;
    } else {
      return null;
    }
  };

  const { data, isLoading, isValidating, setSize, error, size } = useSWRInfinite<
    FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }>; totalCount: number }>,
    Error
  >(searching ? getPatientUrl : null, openmrsFetch, {
    initialSize: resultsToFetch < patientUuids.length ? resultsToFetch : patientUuids.length,
  });

  useEffect(() => {
    if (error) {
      showNotification({
        kind: 'error',
        title: t('fetchingPatientFailed', 'Fetching patient details failed'),
        description: error.message,
      });
    }
  }, [error, t]);

  const results = useMemo(
    () => ({
      data: data ? [].concat(...data?.map((resp) => resp?.data)) : null,
      isLoading: isLoading,
      fetchError: error,
      hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.totalCount,
    }),
    [data, isLoading, isValidating, error, setSize, size],
  );

  return results;
}
