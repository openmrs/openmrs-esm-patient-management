import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, type FetchResponse, useConfig, useSession } from '@openmrs/esm-framework';
import {
  cohortUrl,
  getAllPatientLists,
  getPatientListIdsForPatient,
  getPatientListMembers,
} from './patient-list.resource';
import { type PatientListManagementConfig } from '../config-schema';
import {
  type CohortResponse,
  type CohortType,
  type OpenmrsCohort,
  type OpenmrsCohortMember,
  type PatientListFilter,
  PatientListType,
} from './types';
import { useActiveVisits } from '@openmrs/esm-active-visits-app/src/active-visits-widget/active-visits.resource';

interface PatientListResponse {
  results: CohortResponse<OpenmrsCohort>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}

/**
 * Hook to create a patient list from active visits
 * This transforms the active visits data into a patient list format
 */
export function useActiveVisitsPatientList() {
  const { activeVisits, isLoading, error, totalResults } = useActiveVisits();
  const { user } = useSession();

  const activeVisitsPatientList = useMemo(() => {
    const starredListsString = user?.userProperties?.starredPatientLists ?? '';
    const starredListsArray = starredListsString.split(',').filter(Boolean);
    const isStarred = starredListsArray.includes('active-visits-system-list');

    return {
      id: 'active-visits-system-list',
      display: 'Active Visits',
      description: 'Patients currently with active visits at this location',
      type: PatientListType.SYSTEM,
      size: totalResults,
      isStarred,
      patientUuids: activeVisits?.map((visit) => visit.patientUuid) || [],
    };
  }, [activeVisits, totalResults, user?.userProperties?.starredPatientLists]);

  return {
    activeVisitsPatientList,
    isLoading,
    error,
  };
}

export function useAllPatientLists({ isStarred, type }: PatientListFilter) {
  const custom = 'custom:(uuid,name,description,display,size,attributes,cohortType,location:(uuid,display))';
  const query: Array<[string, string]> = [
    ['v', custom],
    ['totalCount', 'true'],
  ];
  const config = useConfig<PatientListManagementConfig>();

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

  const patientListsData = (data?.flatMap((res) => res?.data?.results ?? []) ?? []).map((cohort) => ({
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: cohort.cohortType?.display,
    size: cohort.size,
    location: cohort.location,
  }));

  const { user } = useSession();

  // Fetch Active Visits list
  const {
    activeVisitsPatientList,
    isLoading: isLoadingActiveVisits,
    error: activeVisitsError,
  } = useActiveVisitsPatientList();

  const starredListsArray = useMemo(() => {
    const starredString = user?.userProperties?.starredPatientLists ?? '';
    return starredString.split(',').filter(Boolean);
  }, [user?.userProperties?.starredPatientLists]);

  const allPatientLists = useMemo(() => {
    let lists = [...patientListsData];

    if (type === PatientListType.SYSTEM || !type) {
      lists = [activeVisitsPatientList, ...lists];
    }

    if (isStarred) {
      lists = lists.filter(({ id }) => starredListsArray.includes(id));

      if (activeVisitsPatientList.isStarred) {
        const hasActiveVisits = lists.some((list) => list.id === 'active-visits-system-list');
        if (!hasActiveVisits) {
          lists = [activeVisitsPatientList, ...lists];
        }
      }
    }

    return lists;
  }, [patientListsData, activeVisitsPatientList, type, isStarred, starredListsArray]);

  return {
    patientLists: allPatientLists,
    isLoading: isLoading || isLoadingActiveVisits,
    isValidating,
    error: error || activeVisitsError,
    mutate,
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
  const config = useConfig<PatientListManagementConfig>();
  return useSWR(['patientListWithoutPatient', patientUuid], async () => {
    const [allLists, listsIdsOfThisPatient] = await Promise.all([
      getAllPatientLists({}, config?.myListCohortTypeUUID, config?.systemListCohortTypeUUID),
      getPatientListIdsForPatient(patientUuid),
    ]);

    const listsWithoutPatient = allLists.filter(
      (list) => !listsIdsOfThisPatient.includes(list.id) && list.id !== 'active-visits-system-list',
    );
    return listsWithoutPatient;
  });
}

export function usePatientListDetails(patientListUuid: string) {
  const { user } = useSession();

  const isActiveVisitsList = patientListUuid === 'active-visits-system-list';

  const {
    activeVisitsPatientList,
    isLoading: isLoadingActiveVisits,
    error: activeVisitsError,
  } = useActiveVisitsPatientList();

  const url = !isActiveVisitsList
    ? `${cohortUrl}/cohort/${patientListUuid}?v=custom:(uuid,name,description,display,size,attributes,startDate,endDate,cohortType)`
    : null;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<OpenmrsCohort>, Error>(url, openmrsFetch);

  const listDetails = useMemo(() => {
    if (isActiveVisitsList) {
      if (!activeVisitsPatientList) return null;

      return {
        uuid: activeVisitsPatientList.id,
        name: activeVisitsPatientList.display,
        description: activeVisitsPatientList.description,
        display: activeVisitsPatientList.display,
        size: activeVisitsPatientList.size,
        cohortType: {
          uuid: 'system',
          display: PatientListType.SYSTEM,
        },
        attributes: [],
        startDate: null,
        endDate: null,
      };
    }

    return data?.data;
  }, [isActiveVisitsList, activeVisitsPatientList, data?.data]);

  return {
    listDetails,
    error: isActiveVisitsList ? activeVisitsError : error,
    isLoading: isActiveVisitsList ? isLoadingActiveVisits : isLoading,
    mutateListDetails: isActiveVisitsList ? () => {} : mutate, // No-op for system list
  };
}

export function usePatientListMembers(
  patientListUuid: string,
  searchQuery: string = '',
  startIndex: number = 0,
  pageSize: number = 10,
  v: string = 'full',
) {
  const isActiveVisitsList = patientListUuid === 'active-visits-system-list';

  const { activeVisits, isLoading: isLoadingActiveVisits, error: activeVisitsError, totalResults } = useActiveVisits();

  const apiUrl = !isActiveVisitsList
    ? `${cohortUrl}/cohortmember?cohort=${patientListUuid}&startIndex=${startIndex}&limit=${pageSize}&v=${v}&q=${searchQuery}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<CohortResponse<OpenmrsCohortMember>>, Error>(
    apiUrl,
    openmrsFetch,
  );

  const { listMembers: activeVisitsMembers, filteredCount } = useMemo(() => {
    if (!isActiveVisitsList || !activeVisits || activeVisits.length === 0) {
      return { listMembers: [], filteredCount: 0 };
    }

    const visits = activeVisits as any[];

    let filtered = visits;
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = visits.filter((visit: any) => {
        const name = visit.patient?.person?.display || visit.patient?.display || visit.name || visit.patientName || '';
        const identifier = visit.patient?.identifiers?.[0]?.identifier || visit.identifier || visit.idNumber || '';
        const gender = visit.patient?.person?.gender || visit.gender || visit.sex || '';

        return (
          name.toLowerCase().includes(lowerSearch) ||
          identifier.toLowerCase().includes(lowerSearch) ||
          gender.toLowerCase().includes(lowerSearch)
        );
      });
    }

    const filteredCount = filtered.length;

    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    const members = paginated.map((visit: any) => {
      const patientUuid = visit.patient?.uuid || visit.patientUuid || '';

      let patientDisplay = '';
      if (visit.patient?.display) {
        patientDisplay = visit.patient.display;
      } else if (visit.patient?.person?.display) {
        patientDisplay = visit.patient.person.display;
      } else if (visit.name) {
        patientDisplay = visit.name;
      } else if (visit.patientName) {
        patientDisplay = visit.patientName;
      }

      let identifierValue = '';
      if (visit.patient?.identifiers && visit.patient.identifiers.length > 0) {
        identifierValue = visit.patient.identifiers[0].identifier;
      } else if (visit.identifier) {
        identifierValue = visit.identifier;
      } else if (visit.idNumber) {
        identifierValue = visit.idNumber;
      }

      let ageValue;
      if (visit.patient?.person?.age !== undefined) {
        ageValue = visit.patient.person.age;
      } else if (visit.age !== undefined) {
        ageValue = typeof visit.age === 'string' ? parseInt(visit.age, 10) : visit.age;
      }

      const genderValue = visit.patient?.person?.gender || visit.gender || visit.sex || '';

      let attributesArray = visit.patient?.person?.attributes || [];
      if (
        visit.telephoneNumber &&
        !attributesArray.some((attr: any) => attr?.attributeType?.display === 'Telephone Number')
      ) {
        attributesArray = [
          ...attributesArray,
          {
            attributeType: { display: 'Telephone Number' },
            value: visit.telephoneNumber,
          },
        ];
      }

      const visitStartDate =
        visit.startDatetime || visit.visitStartDatetime || visit.visitStartTime || new Date().toISOString();

      return {
        uuid: `visit-${visit.visitUuid || visit.uuid || visit.id}`,
        patient: {
          uuid: patientUuid,
          identifiers: [
            {
              identifier: identifierValue,
            },
          ],
          person: {
            display: patientDisplay,
            age: ageValue,
            gender: genderValue,
            attributes: attributesArray,
          },
        },
        startDate: visitStartDate,
        endDate: null,
      };
    });

    return { listMembers: members, filteredCount };
  }, [isActiveVisitsList, activeVisits, searchQuery, startIndex, pageSize]);

  return {
    listMembers: isActiveVisitsList ? activeVisitsMembers : (data?.data?.results ?? []),
    isLoadingListMembers: isActiveVisitsList ? isLoadingActiveVisits : isLoading,
    error: isActiveVisitsList ? activeVisitsError : error,
    mutateListMembers: isActiveVisitsList ? () => {} : mutate, // No-op for system list
    totalCount: isActiveVisitsList ? (searchQuery ? filteredCount : totalResults) : data?.data?.totalCount,
  };
}

export function useCohortTypes() {
  const apiUrl = `${cohortUrl}/cohorttype`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<CohortResponse<CohortType>>, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    listCohortTypes: data?.data?.results ?? [],
    isLoading,
    error,
    mutate,
  };
}
