import { PatientList, PatientListFilter } from './types';
import { useAsync, useAsyncQuery } from '../utils/use-async.hook';
import {
  getLocalAndRemotePatientListMembers,
  getLocalAndRemotePatientLists,
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

export function useGetAllPatientListMembersQuery(patientListId: string) {
  return useAsyncQuery(() => getLocalAndRemotePatientListMembers(patientListId), [patientListId]);
}
