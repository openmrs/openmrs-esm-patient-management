import { isOfflineUuid } from '@openmrs/esm-framework';
import {
  addPatientToLocalPatientList,
  getAllLocalPatientLists,
  getLocalPatientListIdsForPatient,
  getLocalPatientListMembers,
  updateLocalPatientList,
} from './api-local';
import { addPatientToList, getAllPatientLists, getPatientListIdsForPatient, getPatientListMembers } from './api-remote';
import {
  AddPatientData,
  OpenmrsCohort,
  PatientList,
  PatientListFilter,
  PatientListType,
  PatientListUpdate,
} from './types';

export async function getLocalAndRemotePatientLists(
  userId: string,
  filter?: PatientListFilter,
  abortController = new AbortController(),
): Promise<Array<PatientList>> {
  const localPromise = getAllLocalPatientLists(userId, filter);
  const remotePromise = getAllPatientLists(filter, abortController).then((cohorts) =>
    cohorts.map(mapCohortToPatientList),
  );
  return awaitAllAndMerge(localPromise, remotePromise);
}

function mapCohortToPatientList(cohort: OpenmrsCohort): PatientList {
  return {
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: cohort.attributes.find((att) => att?.cohortAttributeType?.name === 'Patient List Type')?.value, // TODO
    size: cohort.size, // TODO
    isStarred: false, // TODO,
  };
}

export async function getLocalAndRemotePatientListsForPatient(
  userId: string,
  patientId: string,
  abortController?: AbortController,
) {
  const localPromise = getLocalPatientListIdsForPatient(userId, patientId);
  const remotePromise = getPatientListIdsForPatient(patientId, abortController);
  return awaitAllAndMerge(localPromise, remotePromise);
}

function awaitAllAndMerge<T>(...promises: Array<Promise<Array<T>>>): Promise<Array<T>> {
  return Promise.all(promises).then((lists) => [].concat.apply([], lists));
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
