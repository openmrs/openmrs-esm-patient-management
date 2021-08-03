import { AddPatientData, PatientList, PatientListFilter, PatientListMember } from './types';
import { useAsync, useAsyncQuery } from '../utils/use-async.hook';
import {
  addPatientToLocalOrRemotePatientList,
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

export function useGetAllPatientListMembersQuery(userId?: string, patientListId?: string) {
  return useAsyncQuery(() => {
    if (!userId || !patientListId) {
      return Promise.resolve<Array<PatientListMember>>([]);
    }

    return getLocalAndRemotePatientListMembers(userId, patientListId);
  }, [userId, patientListId]);
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
