import { isOfflineUuid } from '@openmrs/esm-framework';
import {
  getAllLocalPatientLists,
  getAllPatientLists,
  OpenmrsCohort,
  getLocalPatientListMembers,
  getPatientListMembers,
  updateLocalPatientList,
} from '.';
import { PatientListFilter, PatientList, PatientListType, PatientListUpdate } from './types';

export async function getLocalAndRemotePatientLists(
  userId: string,
  filter?: PatientListFilter,
  abortController = new AbortController(),
): Promise<Array<PatientList>> {
  const localPromise = getAllLocalPatientLists(userId, filter);
  const onlinePromise = getAllPatientLists(filter, abortController).then((cohorts) =>
    cohorts.map(mapCohortToPatientList),
  );
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

export function getLocalAndRemotePatientListMembers(patientListId: string, abortController?: AbortController) {
  return isOfflineUuid(patientListId)
    ? getLocalPatientListMembers(patientListId)
    : getPatientListMembers(patientListId, abortController);
}

export function updateLocalOrRemotePatientList(
  userId: string,
  patientListId: string,
  update: PatientListUpdate,
  abortController?: AbortController,
) {
  if (isOfflineUuid(patientListId)) {
    return updateLocalPatientList(userId, patientListId, update);
  } else {
    //updatePatientListDetails(listUuid, { isStarred: star }).then(() => setChanged((c) => !c));
  }
}
