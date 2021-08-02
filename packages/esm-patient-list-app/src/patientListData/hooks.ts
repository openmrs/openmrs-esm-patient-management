import { isOfflineUuid } from '@openmrs/esm-framework';
import { getAllPatientLists, OpenmrsCohort } from './api';
import { getAllDeviceLocalPatientLists, getDeviceLocalPatientListMembers, updateDeviceLocalPatientList } from './';
import { getPatientListMembers } from './mock';
import { PatientListType, PatientList, PatientListFilter } from './types';
import { useAsync, useAsyncQuery } from '../utils/use-async.hook';

export function usePatientListDataQuery(userId?: string, filter?: PatientListFilter) {
  return useAsyncQuery(
    ({ abortController }) => {
      if (!userId) {
        return Promise.resolve<Array<PatientList>>([]);
      }

      return getLocalAndOnlinePatientLists(userId, filter, abortController);
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
    if (isOfflineUuid(patientListId)) {
      return updateDeviceLocalPatientList(userId, patientListId, { isStarred });
    } else {
      //updatePatientListDetails(listUuid, { isStarred: star }).then(() => setChanged((c) => !c));
    }
  });
}

/** Fetches and merges patient lists from the device and backend into a single patient list array. */
async function getLocalAndOnlinePatientLists(
  userId: string,
  filter?: PatientListFilter,
  ac = new AbortController(),
): Promise<Array<PatientList>> {
  const localPromise = getAllDeviceLocalPatientLists(userId, filter);
  const onlinePromise = getAllPatientLists(filter, ac).then((cohorts) => cohorts.map(mapCohortToPatientList));
  return Promise.all([localPromise, onlinePromise]).then((lists) => [].concat.apply([], lists));
}

function mapCohortToPatientList(cohort: OpenmrsCohort): PatientList {
  return {
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: PatientListType.SYSTEM, // TODO
    memberCount: 0, // TODO
    isStarred: false, // TODO,
  };
}

export function useGetAllPatientListMembersQuery(patientListId: string) {
  return useAsyncQuery(() => {
    return isOfflineUuid(patientListId)
      ? getDeviceLocalPatientListMembers(patientListId)
      : getPatientListMembers(patientListId);
  });
}
