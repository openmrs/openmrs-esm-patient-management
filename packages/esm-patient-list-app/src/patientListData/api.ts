import { isOfflineUuid } from '@openmrs/esm-framework';
import {
  getAllLocalPatientLists,
  getAllPatientLists,
  OpenmrsCohort,
  getLocalPatientListMembers,
  getPatientListMembers,
  updateLocalPatientList,
} from '.';
import { addPatientToLocalPatientList } from './api-local';
import { addPatientToList } from './api-remote';
import { PatientListFilter, PatientList, PatientListType, PatientListUpdate, AddPatientData } from './types';

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

export function getLocalAndRemotePatientListMembers(
  userId: string,
  patientListId: string,
  abortController?: AbortController,
) {
  return isOfflineUuid(patientListId)
    ? getLocalPatientListMembers(userId, patientListId)
    : getPatientListMembers(patientListId, abortController);
}

export function addPatientToLocalOrRemotePatientList(
  userId: string,
  data: AddPatientData,
  abortController = new AbortController(),
) {
  if (isOfflineUuid(data.cohort)) {
    return addPatientToLocalPatientList(userId, data.cohort, data.patient);
  } else {
    return addPatientToList(data, abortController);
  }
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
