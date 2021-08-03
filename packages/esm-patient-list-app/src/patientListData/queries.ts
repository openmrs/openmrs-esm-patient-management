import { AddPatientData, PatientList, PatientListFilter, PatientListMember } from './types';
import { useAsync, useAsyncQuery } from '../utils/use-async.hook';
import {
  getLocalAndRemotePatientListMembers,
  getLocalAndRemotePatientLists,
  getLocalAndRemotePatientListsForPatient,
  updateLocalOrRemotePatientList,
} from './api';

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

export function useGetAllPatientListMembersQuery(userId?: string, patientListId?: string) {
  return useAsyncQuery(() => {
    if (!userId || !patientListId) {
      return Promise.resolve<Array<PatientListMember>>([]);
    }

    return getLocalAndRemotePatientListMembers(userId, patientListId);
  }, [userId, patientListId]);
}

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

export interface ToggleStarredMutationArgs {
  userId: string;
  patientListId: string;
  isStarred: boolean;
}

export function useToggleStarredMutation() {
  return useAsync(({ userId, patientListId, isStarred }: ToggleStarredMutationArgs, { abortController }) => {
    return updateLocalOrRemotePatientList(userId, patientListId, { isStarred }, abortController);
  });
}

export interface AddPatientToPatientListMutationArgs {
  userId: string;
  data: Array<AddPatientData>;
}
