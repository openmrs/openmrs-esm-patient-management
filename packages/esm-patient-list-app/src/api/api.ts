import { isOfflineUuid } from '@openmrs/esm-framework';
import {
  addPatientToLocalPatientList,
  getAllLocalPatientLists,
  getLocalPatientListIdsForPatient,
  getLocalPatientListMembers,
  updateLocalPatientList,
} from './api-local';
import { addPatientToList, getAllPatientLists, getPatientListIdsForPatient, getPatientListMembers } from './api-remote';
import { AddPatientData, OpenmrsCohort, PatientList, PatientListFilter, PatientListUpdate } from './types';

export async function getLocalAndRemotePatientLists(
  userId: string,
  filter?: PatientListFilter,
  abortController = new AbortController(),
): Promise<Array<PatientList>> {
  const localPromise = getAllLocalPatientLists(userId, filter);
  const remotePromise = getAllPatientLists(filter, abortController).then((cohorts) =>
    cohorts.map(mapCohortToPatientList),
  );
  return awaitAllAndMergeFulfilledResults(localPromise, remotePromise);
}

function mapCohortToPatientList(cohort: OpenmrsCohort): PatientList {
  return {
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: cohort.attributes.find((att) => att?.cohortAttributeType?.name === 'Patient List Type')?.value,
    size: cohort.size,
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
  return awaitAllAndMergeFulfilledResults(localPromise, remotePromise);
}

/**
 * Awaits the given promises resolving to arrays and merges these arrays into one once all promises are settled.
 * This ignores all promises which throw errors and only returns the results of those that succeeded.
 * The reason for that is that
 * a) we don't have any error designs for patient lists at the time of writing this (i.e. all errors are swallowed
 *    anyway from the perspective of the UI)
 * b) it would be an issue if we would fail (and thus displaying nothing) if only one of multiple promises fails.
 *    This would mean that e.g. no patient list is displayed in a table even if some lists could be loaded.
 *    See https://issues.openmrs.org/browse/O3-1092 for a ticket which addressed this issue.
 */
async function awaitAllAndMergeFulfilledResults<T>(...promises: Array<Promise<Array<T>>>): Promise<Array<T>> {
  const results = await Promise.allSettled(promises);
  const data = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as unknown as PromiseFulfilledResult<T>).value);
  return [].concat.apply([], data);
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

export function updateLocalOrRemotePatientList(userId: string, patientListId: string, update: PatientListUpdate) {
  if (isOfflineUuid(patientListId)) {
    return updateLocalPatientList(userId, patientListId, update);
  } else {
    // TODO: Update the remote patient list. At the moment it seems like this is not supported by the API?
  }
}
