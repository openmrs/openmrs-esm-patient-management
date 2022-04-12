import {
  CohortResponse,
  CohortType,
  OpenmrsCohort,
  OpenmrsCohortMember,
  PatientList,
  PatientListFilter,
  PatientListMember,
} from './types';
import {
  getLocalAndRemotePatientListMembers,
  getLocalAndRemotePatientLists,
  getLocalAndRemotePatientListsForPatient,
} from './api';
import { getLocalPatientListMembers, offlinePatientListId, removePatientFromLocalPatientList } from './api-local';
import { fetchCurrentPatient, openmrsFetch, FetchResponse } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { cohortUrl } from './api-remote';

/**
 * A hook for querying all local and remote patient lists belonging to a given user,
 * optionally filtered by the specified {@link filter}.
 */
export function useAllPatientLists(userId?: string, filter?: PatientListFilter) {
  return useSWR(['patientList', userId, filter], () => {
    if (!userId) {
      return Promise.resolve<Array<PatientList>>([]);
    }

    return getLocalAndRemotePatientLists(userId, filter);
  });
}

/**
 * A hook for querying all members of a given local or remote patient list.
 */
export function useAllPatientListMembers(userId?: string, patientListId?: string) {
  return useSWR(['patientListMembers', userId, patientListId], () => {
    if (!userId || !patientListId) {
      return Promise.resolve<Array<PatientListMember>>([]);
    }

    return getLocalAndRemotePatientListMembers(userId, patientListId);
  });
}

/**
 * A hook for querying all local and remote patient lists that exist for a given user,
 * but without those patient lists where a specific patient has already been added as a member.
 *
 * This is intended for displaying all lists to which a given patient can still be added.
 */
export function useAllPatientListsWhichDoNotIncludeGivenPatient(userId?: string, patientUuid?: string) {
  return useSWR(['patientListWithoutPatient', userId, patientUuid], async () => {
    if (!userId || !patientUuid) {
      return [];
    }

    const [allLists, listsIdsOfThisPatient] = await Promise.all([
      getLocalAndRemotePatientLists(userId, undefined),
      getLocalAndRemotePatientListsForPatient(userId, patientUuid),
    ]);

    const listsWithoutPatient = allLists.filter((list) => !listsIdsOfThisPatient.includes(list.id));
    return listsWithoutPatient;
  });
}

export function useAllPatientsFromOfflinePatientList(userId?: string) {
  return useSWR<Array<fhir.Patient>>(['offlinePatientListPatients', userId], async () => {
    if (!userId) {
      return [];
    }

    const allPatientUuids = await getLocalPatientListMembers(userId, offlinePatientListId);
    const patients: Array<{ data: fhir.Patient } | null> = await Promise.all(
      allPatientUuids.map(({ id }) => fetchCurrentPatient(id)),
    );

    return patients.filter(Boolean).map((result) => result.data);
  });
}

export function usePatientListDetails(patientListUuid: string) {
  const swrResult = useSWR<FetchResponse<OpenmrsCohort>, Error>(`${cohortUrl}/cohort/${patientListUuid}`, openmrsFetch);
  return { ...swrResult, data: swrResult?.data?.data };
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
