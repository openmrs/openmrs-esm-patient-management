import { PatientList, PatientListFilter, PatientListMember } from './types';
import { useAsync, useAsyncQuery } from '../utils/use-async.hook';
import {
  getLocalAndRemotePatientListMembers,
  getLocalAndRemotePatientLists,
  getLocalAndRemotePatientListsForPatient,
  updateLocalOrRemotePatientList,
} from './api';
import { getLocalPatientListMembers, offlinePatientListId, removePatientFromLocalPatientList } from './api-local';
import { fetchCurrentPatient, openmrsFetch } from '@openmrs/esm-framework';
import { OpenmrsCohort, OpenmrsCohortMember } from '.';
import useSWR, { KeyedMutator } from 'swr';

const cohortUrl = '/ws/rest/v1/cohortm';

/**
 * A hook for querying all local and remote patient lists belonging to a given user,
 * optionally filtered by the specified {@link filter}.
 */
export function usePatientListDataQuery(userId?: string, filter?: PatientListFilter) {
  return useAsyncQuery(
    ({ abortController }) => {
      if (!userId) {
        return Promise.resolve<Array<PatientList>>([]);
      }

      return getLocalAndRemotePatientLists(userId, filter, abortController);
    },
    [userId, filter],
  );
}

/**
 * A hook for querying all members of a given local or remote patient list.
 */
export function useGetAllPatientListMembersQuery(userId?: string, patientListId?: string) {
  return useAsyncQuery(() => {
    if (!userId || !patientListId) {
      return Promise.resolve<Array<PatientListMember>>([]);
    }

    return getLocalAndRemotePatientListMembers(userId, patientListId);
  }, [userId, patientListId]);
}

/**
 * A hook for querying all local and remote patient lists that exist for a given user,
 * but without those patient lists where a specific patient has already been added as a member.
 *
 * This is intended for displaying all lists to which a given patient can still be added.
 */
export function useGetAllPatientListsWithoutPatientQuery(userId?: string, patientUuid?: string) {
  return useAsyncQuery(
    async ({ abortController }) => {
      if (!userId || !patientUuid) {
        return [];
      }

      const [allLists, listsIdsOfThisPatient] = await Promise.all([
        getLocalAndRemotePatientLists(userId, undefined, abortController),
        getLocalAndRemotePatientListsForPatient(userId, patientUuid, abortController),
      ]);

      const listsWithoutPatient = allLists.filter((list) => !listsIdsOfThisPatient.includes(list.id));
      return listsWithoutPatient;
    },
    [userId, patientUuid],
  );
}

export function useGetAllPatientsFromOfflineListQuery(userId?: string) {
  return useAsyncQuery<Array<fhir.Patient>>(async () => {
    if (!userId) {
      return [];
    }

    const allPatientUuids = await getLocalPatientListMembers(userId, offlinePatientListId);
    const patients: Array<{ data: fhir.Patient } | null> = await Promise.all(
      allPatientUuids.map(({ id }) => fetchCurrentPatient(id)),
    );

    return patients.filter(Boolean).map((result) => result.data);
  }, [userId]);
}

export interface ToggleStarredMutationArgs {
  userId: string;
  patientListId: string;
  isStarred: boolean;
}

/**
 * A hook for mutating a local or remote patient list's `isStarred` attribute.
 */
export function useToggleStarredMutation() {
  return useAsync(({ userId, patientListId, isStarred }: ToggleStarredMutationArgs, { abortController }) => {
    return updateLocalOrRemotePatientList(userId, patientListId, { isStarred }, abortController);
  });
}

export interface RemovePatientsFromOfflinePatientListMutationArgs {
  userId: string;
  patientUuids: Array<string>;
}

/**
 * A hook for removing multiple patients at once from the offline patient list.
 */
export function useRemovePatientsFromOfflinePatientListMutation() {
  return useAsync(async ({ userId, patientUuids }: RemovePatientsFromOfflinePatientListMutationArgs) => {
    if (!userId) {
      return;
    }

    for (const patientUuid of patientUuids) {
      await removePatientFromLocalPatientList(userId, offlinePatientListId, patientUuid);
    }
  });
}

export function usePatientListDetails(patientListUuid: string): [OpenmrsCohort, KeyedMutator<{ data: OpenmrsCohort }>] {
  if (patientListUuid) {
    const {
      data: cohortDetails,
      error,
      mutate,
    } = useSWR<{ data: OpenmrsCohort }, Error>(`${cohortUrl}/cohort/${patientListUuid}`, openmrsFetch);
    if (error) {
      throw error;
    }
    return [cohortDetails?.data, mutate];
  }
}

interface CohortResponse<T = any> {
  results: T[];
  error;
}

export function usePatientListMembers(
  patientListUuid: string,
  startIndex: number = 0,
  pageSize: number = 10,
  v: string = 'full',
): [boolean, OpenmrsCohortMember[], KeyedMutator<{ data: CohortResponse<OpenmrsCohortMember> }>] {
  if (patientListUuid) {
    const { data, error, mutate } = useSWR<{ data: CohortResponse<OpenmrsCohortMember> }, Error>(
      `${cohortUrl}/cohortmember?cohort=${patientListUuid}&startIndex=${startIndex}&pageSize=${pageSize}&v=${v}`,
      openmrsFetch,
    );
    if (error) {
      throw error;
    }
    return [!data && !error, data?.data?.results, mutate];
  }
  return [true, undefined, undefined];
}
