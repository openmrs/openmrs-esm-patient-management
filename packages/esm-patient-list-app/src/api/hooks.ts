import { CohortResponse, CohortType, OpenmrsCohort, OpenmrsCohortMember, PatientListFilter } from './types';
import { openmrsFetch, FetchResponse } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { cohortUrl, getAllPatientLists, getPatientListIdsForPatient, getPatientListMembers } from './api-remote';

export function useAllPatientLists(filter?: PatientListFilter) {
  return useSWR(['patientList', filter], () => getAllPatientLists(filter));
}

export function useAllPatientListMembers(patientListId: string) {
  return useSWR(['patientListMembers', patientListId], () => getPatientListMembers(patientListId));
}

/**
 * A hook for querying all local and remote patient lists that exist for a given user,
 * but without those patient lists where a specific patient has already been added as a member.
 *
 * This is intended for displaying all lists to which a given patient can still be added.
 */
export function useAllPatientListsWhichDoNotIncludeGivenPatient(patientUuid: string) {
  return useSWR(['patientListWithoutPatient', patientUuid], async () => {
    const [allLists, listsIdsOfThisPatient] = await Promise.all([
      getAllPatientLists(),
      getPatientListIdsForPatient(patientUuid),
    ]);

    const listsWithoutPatient = allLists.filter((list) => !listsIdsOfThisPatient.includes(list.id));
    return listsWithoutPatient;
  });
}

// export function useAllPatientsFromOfflinePatientList(userId?: string) {
//   return useSWR<Array<fhir.Patient>>(['offlinePatientListPatients', userId], async () => {
//     if (!userId) {
//       return [];
//     }

//     const allPatientUuids = await getLocalPatientListMembers(userId, offlinePatientListId);
//     const patients: Array<{ data: fhir.Patient } | null> = await Promise.all(
//       allPatientUuids.map(({ id }) => fetchCurrentPatient(id)),
//     );

//     return patients.filter(Boolean).map((result) => result.data);
//   });
// }

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
